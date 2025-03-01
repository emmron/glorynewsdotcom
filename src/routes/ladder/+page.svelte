<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { fetchALeagueLadder } from '$lib/services/ladderService';
  import type { LeagueLadder, TeamStats } from '$lib/types';

  let ladder: LeagueLadder | null = null;
  let loading = true;
  let error = '';
  let highlightedTeam: string | null = null;
  let autoRefreshEnabled = true;
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let showStats = false;
  let selectedStat: 'points' | 'goalDifference' | 'goalsFor' | 'goalsAgainst' = 'points';
  let previousLadder: LeagueLadder | null = null;
  let showChanges = false;

  // Auto-refresh every 5 minutes if enabled
  $: if (autoRefreshEnabled && !refreshInterval) {
    refreshInterval = setInterval(handleRefresh, 5 * 60 * 1000);
  } else if (!autoRefreshEnabled && refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }

  onMount(async () => {
    try {
      loading = true;
      ladder = await fetchALeagueLadder();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load ladder';
      console.error('Error in onMount:', e);
    } finally {
      loading = false;
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  });

  const handleRefresh = async () => {
    try {
      previousLadder = ladder;
      const newLadder = await fetchALeagueLadder();
      if (JSON.stringify(newLadder) !== JSON.stringify(ladder)) {
        ladder = newLadder;
        showChanges = true;
        setTimeout(() => { showChanges = false; }, 5000); // Hide changes after 5 seconds
      }
    } catch (e) {
      console.error('Error in auto-refresh:', e);
    }
  };

  const handleRetry = async () => {
    try {
      loading = true;
      ladder = await fetchALeagueLadder();
      error = '';
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
      <div class="ladder-page__content bg-white rounded-2xl shadow-sm p-8">
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
                >
                  <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
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
                {#each ladder.teams as team}
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
            </div>
            <div class="flex items-center gap-2">
              <span>Click on a team to highlight their position</span>
            </div>
          </div>
        {/if}
      </div>
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
    @apply rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50;
  }

  :global(.form-select) {
    @apply rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500;
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

  /* Responsive design improvements */
  @media (max-width: 640px) {
    .ladder-page__header-container {
      padding: 0 1rem;
    }

    .ladder-page__content {
      padding: 1rem;
    }
  }
</style>
