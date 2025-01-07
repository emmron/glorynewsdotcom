<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { fetchRecentMatches } from '$lib/services/matchService';
  import type { RecentMatches } from '$lib/types';

  let matches: RecentMatches | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      loading = true;
      matches = await fetchRecentMatches();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load matches';
      console.error('Error in onMount:', e);
    } finally {
      loading = false;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultClass = (homeScore: number, awayScore: number, teamName: string) => {
    if (!homeScore && !awayScore) return 'text-gray-500'; // Not played yet
    const isHomeTeam = teamName === 'Perth Glory';
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const oppositionScore = isHomeTeam ? awayScore : homeScore;
    
    if (teamScore > oppositionScore) return 'text-green-600 font-bold';
    if (teamScore < oppositionScore) return 'text-red-600';
    return 'text-gray-600'; // Draw
  };
</script>

<div class="recent-matches bg-white rounded-2xl shadow-sm p-8 mb-8">
  <h2 class="text-2xl font-bold text-purple-900 mb-6">Recent Matches</h2>
  
  {#if loading}
    <div class="flex justify-center items-center h-32" in:fade>
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
    </div>
  {:else if error}
    <div class="text-center text-red-600 py-4" in:fade>
      <p>{error}</p>
    </div>
  {:else if matches}
    <div class="grid gap-4">
      {#each matches.matches as match}
        <div 
          class="match-card bg-gray-50 rounded-xl p-4 hover:bg-purple-50 transition-colors duration-200"
          in:slide|local={{ duration: 300 }}
        >
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <img 
                  src={match.homeTeam.logo} 
                  alt={match.homeTeam.name}
                  class="w-8 h-8 object-contain"
                />
                <span class="text-sm font-medium {getResultClass(match.homeTeam.score, match.awayTeam.score, match.homeTeam.name)}">
                  {match.homeTeam.name}
                </span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <img 
                  src={match.awayTeam.logo} 
                  alt={match.awayTeam.name}
                  class="w-8 h-8 object-contain"
                />
                <span class="text-sm font-medium {getResultClass(match.homeTeam.score, match.awayTeam.score, match.awayTeam.name)}">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
            
            <div class="text-center px-6">
              {#if match.isCompleted}
                <div class="text-2xl font-bold text-gray-900">
                  {match.homeTeam.score} - {match.awayTeam.score}
                </div>
                <div class="text-xs text-gray-500 mt-1">FT</div>
              {:else}
                <div class="text-sm font-medium text-purple-600">
                  {formatDate(match.date)}
                </div>
              {/if}
            </div>
            
            <div class="flex-1 text-right">
              <div class="text-sm text-gray-500">{match.competition}</div>
              <div class="text-xs text-gray-400 mt-1">{match.venue}</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .match-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .match-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
</style>
