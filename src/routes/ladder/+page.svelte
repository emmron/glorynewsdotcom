<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import type { LeagueLadder, TeamStats } from '$lib/types';
  import { invalidateAll } from '$app/navigation';

  // Get data from server-side load function
  export let data;

  let ladder: LeagueLadder | null = null;
  let loading = false;
  let error = '';
  let highlightedTeam: string | null = null;
  let autoRefreshEnabled = true;
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let showStats = false;
  let selectedStat: 'points' | 'goalDifference' | 'goalsFor' | 'goalsAgainst' = 'points';
  let previousLadder: LeagueLadder | null = null;
  let showChanges = false;
  let loadingRefresh = false;
  let retryCount = 0;
  let lastRefreshAttempt = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds delay between retries
  const MIN_REFRESH_INTERVAL = 30000; // 30 seconds minimum between refreshes

  // Performance optimization: Memoize sorted and filtered teams
  $: sortedTeams = ladder?.teams.sort((a, b) => {
    if (selectedStat === 'points') {
      return b.points - a.points || b.goalDifference - a.goalDifference;
    }
    return b[selectedStat] - a[selectedStat];
  }) ?? [];

  // Sync the data from the load function with better error handling
  $: {
    if (data) {
      if (data.error) {
        error = data.error.message || 'Failed to load data from server';
        console.error('Server data error:', data.error);
      } else {
        error = '';
        previousLadder = ladder;
        ladder = data.ladder || null;

        if (ladder && previousLadder && ladder !== previousLadder) {
          showChanges = true;
          setTimeout(() => { showChanges = false; }, 5000);
        }
      }
    }
  }

  // Get the matches data with improved error handling
  $: matches = data?.matches || null;

  // Auto-refresh with rate limiting
  $: if (autoRefreshEnabled && !refreshInterval) {
    refreshInterval = setInterval(handleRefresh, 5 * 60 * 1000);
  } else if (!autoRefreshEnabled && refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }

  onMount(() => {
    if (!data?.ladder && !loading && !error) {
      handleRetry();
    }

    // Add keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });

  const handleRefresh = async () => {
    const now = Date.now();
    if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL) {
      console.log('Refresh rate limited. Please wait before trying again.');
      return;
    }

    try {
      loadingRefresh = true;
      lastRefreshAttempt = now;
      previousLadder = ladder;

      await invalidateAll();
      retryCount = 0;
    } catch (e) {
      console.error('Error in auto-refresh:', e);
      handleRefreshError(e);
    } finally {
      loadingRefresh = false;
    }
  };

  const handleRefreshError = (e: unknown) => {
    const errorMessage = e instanceof Error ? e.message : 'Failed to refresh data';
    error = errorMessage;

    // Implement exponential backoff for retries
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount - 1);
      console.log(`Retrying in ${backoffDelay / 1000}s (attempt ${retryCount}/${MAX_RETRIES})`);

      setTimeout(() => {
        handleRetry();
      }, backoffDelay);
    }
  };

  const handleRetry = async () => {
    try {
      loading = true;
      error = '';

      // Use invalidateAll to refresh all data
      await invalidateAll();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load ladder';
      console.error('Error in handleRetry:', e);
    } finally {
      loading = false;
    }
  };

  const getFormColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'w': return 'bg-green-100 text-green-800 border border-green-200';
      case 'l': return 'bg-red-100 text-red-800 border border-red-200';
      case 'd': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPositionStyle = (position: number) => {
    if (position <= 6) return 'text-green-600 font-semibold'; // Finals position
    if (ladder?.teams && position >= ladder.teams.length - 1) return 'text-red-600 font-semibold'; // Relegation position
    return 'text-gray-900';
  };

  const toggleTeamHighlight = (teamName: string) => {
    highlightedTeam = highlightedTeam === teamName ? null : teamName;
  };

  const isPlayoffPosition = (position: number) => position <= 6;
  const isRelegationPosition = (position: number, totalTeams: number) => position === totalTeams;

  const getPositionChange = (team: TeamStats) => {
    if (!previousLadder || !showChanges) return null;
    const previousTeam = previousLadder.teams.find(t => t.teamName === team.teamName);
    if (!previousTeam) return null;
    return team.position - previousTeam.position;
  };

  const getStatBarWidth = (value: number, maxValue: number) => {
    return `${(value / maxValue) * 100}%`;
  };

  const getMaxStat = (stat: 'points' | 'goalDifference' | 'goalsFor' | 'goalsAgainst') => {
    if (!ladder) return 0;
    return Math.max(...ladder.teams.map(team => Math.abs(team[stat])));
  };

  const formatStat = (stat: string) => {
    return stat.replace(/([A-Z])/g, ' $1').toLowerCase();
  };

  const formatMatchDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === now.toDateString()) {
        return 'Today, ' + date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow, ' + date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }

      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const getMatchResultClass = (homeScore: number, awayScore: number, teamName: string) => {
    if (!homeScore && !awayScore) return 'text-gray-500'; // Not played yet
    const isHomeTeam = teamName.includes('Perth Glory');
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const oppositionScore = isHomeTeam ? awayScore : homeScore;

    if (teamScore > oppositionScore) return 'text-green-600 font-bold';
    if (teamScore < oppositionScore) return 'text-red-600';
    return 'text-gray-600'; // Draw
  };

  const shortenTeamName = (name: string) => {
    return name
      .replace(' FC', '')
      .replace(' United', ' Utd')
      .replace('Western Sydney Wanderers', 'WS Wanderers')
      .replace('Melbourne City', 'Melb City')
      .replace('Brisbane Roar', 'Brisbane');
  };

  // Add statistics for the highlighted team
  $: highlightedTeamStats = highlightedTeam
    ? ladder?.teams.find(team => team.teamName === highlightedTeam)
    : null;

  // Get team's recent matches
  $: teamRecentMatches = highlightedTeam && matches
    ? matches.matches.filter(match =>
        match.homeTeam.name.includes(highlightedTeam) ||
        match.awayTeam.name.includes(highlightedTeam)
      ).slice(0, 5)
    : [];

  // Calculate team form statistics
  $: teamFormStats = highlightedTeamStats
    ? {
        winPercentage: (highlightedTeamStats.won / highlightedTeamStats.played * 100).toFixed(1),
        avgGoalsScored: (highlightedTeamStats.goalsFor / highlightedTeamStats.played).toFixed(1),
        avgGoalsConceded: (highlightedTeamStats.goalsAgainst / highlightedTeamStats.played).toFixed(1),
        cleanSheets: highlightedTeamStats.form.filter(result => result.toLowerCase() === 'w' && highlightedTeamStats.goalsAgainst === 0).length,
        streak: getStreakInfo(highlightedTeamStats.form)
      }
    : null;

  const getStreakInfo = (form: string[]) => {
    if (!form || form.length === 0) return { type: 'none', count: 0 };

    let count = 1;
    const current = form[0].toLowerCase();

    for (let i = 1; i < form.length; i++) {
      if (form[i].toLowerCase() === current) {
        count++;
      } else {
        break;
      }
    }

    let type = 'none';
    if (current === 'w') type = 'win';
    else if (current === 'l') type = 'loss';
    else if (current === 'd') type = 'draw';

    return { type, count };
  };

  // Add new helper functions for improved UX
  const getTeamTrend = (team: TeamStats): 'up' | 'down' | 'neutral' => {
    if (!team.form || team.form.length < 2) return 'neutral';

    const recentResults = team.form.slice(0, 2);
    const points = recentResults.reduce((acc, result) => {
      if (result.toLowerCase() === 'w') return acc + 3;
      if (result.toLowerCase() === 'd') return acc + 1;
      return acc;
    }, 0);

    if (points >= 4) return 'up';
    if (points === 0) return 'down';
    return 'neutral';
  };

  const getTeamStreak = (team: TeamStats): string => {
    if (!team.form || team.form.length === 0) return '';

    let count = 1;
    const current = team.form[0].toLowerCase();

    for (let i = 1; i < team.form.length; i++) {
      if (team.form[i].toLowerCase() === current) {
        count++;
      } else {
        break;
      }
    }

    const type = current === 'w' ? 'win' : current === 'l' ? 'loss' : 'draw';
    return `${count} ${type}${count > 1 ? 's' : ''} in a row`;
  };

  const getTeamPerformanceClass = (team: TeamStats): string => {
    const trend = getTeamTrend(team);
    return trend === 'up'
      ? 'bg-green-50 hover:bg-green-100'
      : trend === 'down'
        ? 'bg-red-50 hover:bg-red-100'
        : 'hover:bg-purple-50';
  };
</script>

<svelte:head>
  <title>A-League Men Ladder | Perth Glory</title>
  <meta name="description" content="View the current A-League Men's ladder standings" />
</svelte:head>

<div class="ladder-page">
  <main class="ladder-page__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="ladder-page__header-container max-w-4xl mx-auto w-full" in:fly="{{ y: 50, duration: 1000 }}">
      <header class="ladder-page__header text-center mb-12">
        <h1 class="ladder-page__title text-4xl md:text-5xl font-bold text-purple-900 tracking-tight">
          A-League Men Ladder
        </h1>
        <p class="ladder-page__subtitle text-gray-600 mt-2 text-lg">
          Current Season Standings
        </p>
      </header>
    </div>

    <section class="ladder-page__section max-w-7xl mx-auto">
      <div class="ladder-page__content bg-white rounded-2xl shadow-sm p-8 mb-8">
        {#if loading}
          <div class="ladder-page__loader flex flex-col justify-center items-center h-64" in:fade>
            <div class="ladder-page__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p class="mt-4 text-purple-600 font-medium">Loading ladder...</p>
          </div>
        {:else if error}
          <div class="ladder-page__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fade>
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-lg font-medium mb-2">{error}</p>
            <button
              class="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
              on:click={handleRetry}
            >
              Try Again
            </button>
          </div>
        {:else if ladder}
          <div class="mb-6 space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-4">
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-sm text-gray-600">Finals Position</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <span class="text-sm text-gray-600">Relegation Zone</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    bind:checked={autoRefreshEnabled}
                    class="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  >
                  Auto-refresh
                </label>
                <button
                  on:click={handleRefresh}
                  class="inline-flex items-center px-3 py-1.5 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={loadingRefresh}
                >
                  {#if loadingRefresh}
                    <div class="h-4 w-4 mr-1.5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                    Refreshing...
                  {:else}
                    <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  {/if}
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 items-center justify-between">
              <div class="flex items-center gap-4">
                <button
                  on:click={() => showStats = !showStats}
                  class="inline-flex items-center px-3 py-1.5 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                {#if showStats}
                  <select
                    bind:value={selectedStat}
                    class="form-select rounded-md border-gray-300 text-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="points">Points</option>
                    <option value="goalDifference">Goal Difference</option>
                    <option value="goalsFor">Goals For</option>
                    <option value="goalsAgainst">Goals Against</option>
                  </select>
                {/if}
              </div>
            </div>
          </div>

          <div class="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr class="bg-gradient-to-r from-purple-50 to-purple-100">
                  <th class="sticky top-0 px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase tracking-wider">Pos</th>
                  <th class="sticky top-0 px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase tracking-wider">Team</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">P</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">W</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">D</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">L</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">GF</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">GA</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">GD</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">PTS</th>
                  <th class="sticky top-0 px-6 py-3 text-center text-xs font-medium text-purple-900 uppercase tracking-wider">Last 5</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each sortedTeams as team}
                  <tr
                    class="hover:bg-purple-50 transition-colors duration-200 cursor-pointer {highlightedTeam === team.teamName ? 'bg-purple-50' : ''}
                          {isPlayoffPosition(team.position) ? 'border-l-4 border-l-green-500' : ''}
                          {isRelegationPosition(team.position, ladder.teams.length) ? 'border-l-4 border-l-red-500' : ''}"
                    on:click={() => toggleTeamHighlight(team.teamName)}
                    in:slide|local={{ duration: 300 }}
                  >
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium {getPositionStyle(team.position)}">
                      <div class="flex items-center gap-2">
                        {team.position}
                        {#if showChanges}
                          {@const change = getPositionChange(team)}
                          {#if change !== null}
                            <span
                              class="text-xs font-medium {change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-gray-400'}"
                              in:scale
                            >
                              {change < 0 ? '↑' : change > 0 ? '↓' : '→'}
                              {Math.abs(change)}
                            </span>
                          {/if}
                        {/if}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img
                          src={team.logo}
                          alt={team.teamName}
                          class="h-8 w-8 mr-3 rounded-full shadow-sm transition-transform duration-300 hover:scale-110"
                        />
                        <span class="text-sm font-medium text-gray-900">{team.teamName}</span>
                      </div>
                      {#if showStats}
                        <div class="mt-2 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            class="h-full bg-purple-500 transition-all duration-500"
                            style="width: {getStatBarWidth(Math.abs(team[selectedStat]), getMaxStat(selectedStat))};"
                          ></div>
                        </div>
                      {/if}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.played}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.won}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.drawn}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.lost}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.goalsFor}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{team.goalsAgainst}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center {team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'}">{team.goalDifference}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">{team.points}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex justify-center gap-1">
                        {#each team.form as result}
                          <span class="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full shadow-sm transition-transform hover:scale-110 {getFormColor(result)}">
                            {result.toUpperCase()}
                          </span>
                        {/each}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 space-y-2 sm:space-y-0">
            <div class="flex items-center gap-2">
              <span class="font-medium">Last updated:</span>
              <time datetime={ladder.lastUpdated}>{new Date(ladder.lastUpdated).toLocaleString('en-AU')}</time>
              {#if loadingRefresh}
                <span class="ml-2 text-purple-500 text-xs animate-pulse">Refreshing...</span>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <span>Click on a team to highlight their position</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Team Form Guide Section -->
      {#if highlightedTeamStats && !loading && !error}
        <div class="max-w-7xl mx-auto mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-8" in:fade={{ duration: 400 }}>
            <h2 class="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
              {#if highlightedTeamStats.logo}
                <img
                  src={highlightedTeamStats.logo}
                  alt={highlightedTeamStats.teamName}
                  class="h-10 w-10 rounded-full shadow-sm"
                />
              {/if}
              {highlightedTeamStats.teamName} Form Guide
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Key Stats -->
              <div class="stats-section rounded-xl bg-gray-50 p-5">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Key Statistics</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Position</div>
                    <div class="text-xl font-bold {getPositionStyle(highlightedTeamStats.position)}">
                      {highlightedTeamStats.position}
                      {#if isPlayoffPosition(highlightedTeamStats.position)}
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">Playoff</span>
                      {/if}
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Win Rate</div>
                    <div class="text-xl font-bold text-gray-800">{teamFormStats?.winPercentage}%</div>
                  </div>

                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Goal Difference</div>
                    <div class="text-xl font-bold {highlightedTeamStats.goalDifference > 0 ? 'text-green-600' : highlightedTeamStats.goalDifference < 0 ? 'text-red-600' : 'text-gray-800'}">
                      {highlightedTeamStats.goalDifference > 0 ? '+' : ''}{highlightedTeamStats.goalDifference}
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Current Streak</div>
                    <div class="text-xl font-bold {teamFormStats?.streak.type === 'win' ? 'text-green-600' : teamFormStats?.streak.type === 'loss' ? 'text-red-600' : 'text-gray-600'}">
                      {teamFormStats?.streak.count} {teamFormStats?.streak.type}{teamFormStats && teamFormStats.streak.count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Avg Goals Scored</div>
                    <div class="text-xl font-bold text-gray-800">{teamFormStats?.avgGoalsScored}</div>
                  </div>

                  <div class="stat-item">
                    <div class="text-sm text-gray-500">Avg Goals Conceded</div>
                    <div class="text-xl font-bold text-gray-800">{teamFormStats?.avgGoalsConceded}</div>
                  </div>
                </div>
              </div>

              <!-- Results Breakdown -->
              <div class="results-section rounded-xl bg-gray-50 p-5">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Results Breakdown</h3>
                <div class="grid grid-cols-3 gap-4 text-center mb-4">
                  <div class="result-card bg-green-50 rounded-lg p-3">
                    <div class="text-3xl font-bold text-green-700">{highlightedTeamStats.won}</div>
                    <div class="text-sm text-gray-600">Wins</div>
                  </div>

                  <div class="result-card bg-gray-100 rounded-lg p-3">
                    <div class="text-3xl font-bold text-gray-700">{highlightedTeamStats.drawn}</div>
                    <div class="text-sm text-gray-600">Draws</div>
                  </div>

                  <div class="result-card bg-red-50 rounded-lg p-3">
                    <div class="text-3xl font-bold text-red-700">{highlightedTeamStats.lost}</div>
                    <div class="text-sm text-gray-600">Losses</div>
                  </div>
                </div>

                <div class="form-visual mt-4">
                  <div class="text-sm text-gray-600 mb-2">Last 5 Games</div>
                  <div class="flex gap-2">
                    {#each highlightedTeamStats.form as result}
                      <div class="w-full h-14 flex items-center justify-center rounded-lg {result.toLowerCase() === 'w' ? 'bg-green-100' : result.toLowerCase() === 'l' ? 'bg-red-100' : 'bg-gray-100'}">
                        <span class="text-lg font-bold {result.toLowerCase() === 'w' ? 'text-green-700' : result.toLowerCase() === 'l' ? 'text-red-700' : 'text-gray-700'}">
                          {result.toUpperCase()}
                        </span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              <!-- Recent Matches -->
              <div class="team-matches-section rounded-xl bg-gray-50 p-5">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Matches</h3>
                {#if teamRecentMatches.length > 0}
                  <div class="flex flex-col gap-3">
                    {#each teamRecentMatches as match}
                      <div class="rounded-lg bg-white p-3 shadow-sm">
                        <div class="text-xs text-gray-500 mb-1">{formatMatchDate(match.date)}</div>
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-medium {getMatchResultClass(match.homeTeam.score, match.awayTeam.score, match.homeTeam.name)}">
                            {shortenTeamName(match.homeTeam.name)}
                          </span>
                          {#if match.isCompleted}
                            <span class="text-base font-bold text-gray-900 px-1.5">
                              {match.homeTeam.score} - {match.awayTeam.score}
                            </span>
                          {:else}
                            <span class="text-xs text-purple-600 font-medium">vs</span>
                          {/if}
                          <span class="text-sm font-medium {getMatchResultClass(match.homeTeam.score, match.awayTeam.score, match.awayTeam.name)}">
                            {shortenTeamName(match.awayTeam.name)}
                          </span>
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="text-center text-gray-500 py-4">
                    No recent matches found
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Recent Matches Section -->
      {#if matches && !loading && !error}
        <div class="max-w-7xl mx-auto mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-8" in:fade={{ duration: 700, delay: 300 }}>
            <h2 class="text-2xl font-bold text-purple-900 mb-6">Recent & Upcoming Matches</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each matches.matches as match, i (match.date)}
                <div
                  class="match-card bg-gray-50 rounded-xl p-4 hover:bg-purple-50 transition-all duration-200 shadow-sm"
                  in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
                >
                  <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-500">
                        {formatMatchDate(match.date)}
                      </span>
                      {#if !match.isCompleted}
                        <span
                          class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          in:slide|local={{ duration: 200 }}
                        >
                          Upcoming
                        </span>
                      {/if}
                    </div>

                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                      <span class="text-sm font-medium {getMatchResultClass(match.homeTeam.score, match.awayTeam.score, match.homeTeam.name)}">
                        {shortenTeamName(match.homeTeam.name)}
                      </span>
                      {#if match.isCompleted}
                        <span class="text-lg font-bold text-gray-900 px-3">
                          {match.homeTeam.score} - {match.awayTeam.score}
                        </span>
                      {:else}
                        <span class="text-sm text-purple-600 font-medium">vs</span>
                      {/if}
                      <span class="text-sm font-medium {getMatchResultClass(match.homeTeam.score, match.awayTeam.score, match.awayTeam.name)}">
                        {shortenTeamName(match.awayTeam.name)}
                      </span>
                    </div>

                    <div class="text-xs text-gray-500 mt-1 flex justify-between">
                      <span class="inline-block">{match.competition}</span>
                      <span class="inline-block">{match.venue}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <div class="mt-4 text-right text-xs text-gray-500">
              Last updated: {new Date(matches.lastUpdated).toLocaleString('en-AU')}
            </div>
          </div>
        </div>
      {/if}
    </section>
  </main>
</div>

<style>
  .ladder-page {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .ladder-page__spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  :global(.form-checkbox) {
    border-radius: 0.25rem;
    border-color: #d1d5db;
    color: #9333ea;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  :global(.form-checkbox:focus) {
    border-color: #d8b4fe;
    outline: none;
    box-shadow: 0 0 0 2px #ddd6fe;
    ring-opacity: 0.5;
  }

  :global(.form-select) {
    border-radius: 0.375rem;
    border-color: #d1d5db;
  }

  :global(.form-select:focus) {
    border-color: #a855f7;
    outline: none;
    box-shadow: 0 0 0 2px #a855f7;
  }

  /* Custom scrollbar styles */
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #9333ea #f3e8ff;
  }

  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f3e8ff;
    border-radius: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: #9333ea;
    border-radius: 4px;
    border: 2px solid #f3e8ff;
  }

  /* Hover effects */
  .ladder-page__content {
    transition: transform 0.3s ease;
  }

  .ladder-page__content:hover {
    transform: translateY(-2px);
  }

  /* Match card styles */
  .match-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-in-out;
  }

  .match-card:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  /* Responsive design improvements */
  @media (max-width: 640px) {
    .ladder-page__header-container {
      padding: 0 1rem;
    }

    .ladder-page__content {
      padding: 1rem;
    }
  }

  /* Form guide styles */
  .stat-item {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .result-card {
    transition: transform 0.2s ease-in-out;
  }

  .result-card:hover {
    transform: translateY(-2px);
  }

  /* Add new styles for improved visual feedback */
  .team-row {
    transition: all 0.2s ease-in-out;
  }

  .team-row:hover {
    transform: translateX(4px);
  }

  .stat-value {
    transition: all 0.3s ease-in-out;
  }

  .stat-value:hover {
    transform: scale(1.1);
  }

  /* Add responsive design improvements */
  @media (max-width: 640px) {
    .ladder-table {
      font-size: 0.875rem;
    }

    .ladder-table th,
    .ladder-table td {
      padding: 0.5rem;
    }
  }

  /* Add animation for position changes */
  .position-change {
    animation: bounce 0.5s ease-in-out;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
</style>
