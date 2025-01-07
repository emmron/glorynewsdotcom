<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import { fetchRecentMatches } from '$lib/services/matchService';
  import type { RecentMatches } from '$lib/types';

  let matches: RecentMatches | null = null;
  let loading = true;
  let error = '';
  let visible = false;

  onMount(async () => {
    try {
      loading = true;
      matches = await fetchRecentMatches();
      // Add slight delay to ensure smooth transition
      setTimeout(() => {
        visible = true;
      }, 100);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load matches';
      console.error('Error in onMount:', e);
    } finally {
      loading = false;
    }
  });

  const formatDate = (dateString: string) => {
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
  };

  const getResultClass = (homeScore: number, awayScore: number, teamName: string) => {
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
</script>

<div class="recent-matches bg-white rounded-2xl shadow-sm p-6 mb-8" in:fly={{ y: 20, duration: 600 }}>
  <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Matches</h2>
  
  {#if loading}
    <div class="flex justify-center items-center h-32" in:fade={{ duration: 200 }}>
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
    </div>
  {:else if error}
    <div class="text-center text-red-600 py-4" in:fly={{ y: 20, duration: 400 }}>
      <p>{error}</p>
    </div>
  {:else if matches && visible}
    <div class="grid gap-4">
      {#each matches.matches as match, i (match.date)}
        <div 
          class="match-card bg-gray-50 rounded-xl p-4 hover:bg-purple-50 transition-all duration-200"
          in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
        >
          <div class="flex flex-col gap-2">
            <div class="text-sm text-gray-500 mb-1">
              {formatDate(match.date)}
              {#if !match.isCompleted}
                <span 
                  class="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                  in:slide|local={{ duration: 200 }}
                >
                  Upcoming
                </span>
              {/if}
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium {getResultClass(match.homeTeam.score, match.awayTeam.score, match.homeTeam.name)}">
                {shortenTeamName(match.homeTeam.name)}
              </span>
              {#if match.isCompleted}
                <span class="text-lg font-bold text-gray-900 px-3">
                  {match.homeTeam.score} - {match.awayTeam.score}
                </span>
              {:else}
                <span class="text-sm text-purple-600 font-medium">vs</span>
              {/if}
              <span class="text-sm font-medium {getResultClass(match.homeTeam.score, match.awayTeam.score, match.awayTeam.name)}">
                {shortenTeamName(match.awayTeam.name)}
              </span>
            </div>
            
            <div class="text-xs text-gray-500 mt-1">
              <span class="inline-block">{match.competition}</span>
              <span class="inline-block mx-1">•</span>
              <span class="inline-block">{match.venue}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div 
      class="mt-4 text-xs text-gray-500"
      in:fade={{ duration: 200, delay: matches.matches.length * 100 }}
    >
      Last updated: {new Date(matches.lastUpdated).toLocaleString('en-AU')}
    </div>
  {/if}
</div>

<style>
  .match-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .match-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  :global(.recent-matches) {
    contain: content;
  }
</style>
