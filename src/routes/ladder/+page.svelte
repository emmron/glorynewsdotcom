<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface TeamStanding {
    position: number;
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string[];
  }

  let standings: TeamStanding[] = [];
  let loading = true;
  let error = false;
  let sortBy = 'position';
  let sortOrder: 'asc' | 'desc' = 'asc';
  let imageError: Record<string, boolean> = {};
  let lastUpdated = new Date();
  let highlightedTeam = 'Perth Glory';
  let filterText = '';

  // Filtered standings based on search
  $: filteredStandings = filterText
    ? standings.filter(team => team.team.toLowerCase().includes(filterText.toLowerCase()))
    : standings;

  function handleImageError(team: string) {
    imageError[team] = true;
  }

  function toggleSort(column: string) {
    if (sortBy === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortOrder = column === 'position' ? 'asc' : 'desc';
    }

    sortStandings();
  }

  function sortStandings() {
    standings = [...standings].sort((a, b) => {
      const aValue = a[sortBy as keyof TeamStanding];
      const bValue = b[sortBy as keyof TeamStanding];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }

  onMount(async () => {
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real app, this would be an API call
      // For now, using mock data
      standings = [
        { position: 1, team: 'Melbourne City', played: 26, won: 16, drawn: 5, lost: 5, goalsFor: 50, goalsAgainst: 32, goalDifference: 18, points: 53, form: ['W', 'W', 'D', 'W', 'L'] },
        { position: 2, team: 'Sydney FC', played: 26, won: 16, drawn: 4, lost: 6, goalsFor: 42, goalsAgainst: 25, goalDifference: 17, points: 52, form: ['W', 'W', 'W', 'L', 'W'] },
        { position: 3, team: 'Central Coast Mariners', played: 26, won: 15, drawn: 5, lost: 6, goalsFor: 47, goalsAgainst: 30, goalDifference: 17, points: 50, form: ['W', 'D', 'W', 'W', 'L'] },
        { position: 4, team: 'Adelaide United', played: 26, won: 14, drawn: 5, lost: 7, goalsFor: 45, goalsAgainst: 35, goalDifference: 10, points: 47, form: ['W', 'L', 'W', 'D', 'W'] },
        { position: 5, team: 'Melbourne Victory', played: 26, won: 13, drawn: 7, lost: 6, goalsFor: 41, goalsAgainst: 28, goalDifference: 13, points: 46, form: ['D', 'W', 'D', 'W', 'W'] },
        { position: 6, team: 'Macarthur FC', played: 26, won: 12, drawn: 6, lost: 8, goalsFor: 38, goalsAgainst: 31, goalDifference: 7, points: 42, form: ['L', 'W', 'L', 'W', 'D'] },
        { position: 7, team: 'Wellington Phoenix', played: 26, won: 11, drawn: 7, lost: 8, goalsFor: 37, goalsAgainst: 32, goalDifference: 5, points: 40, form: ['L', 'D', 'W', 'L', 'W'] },
        { position: 8, team: 'Perth Glory', played: 26, won: 10, drawn: 8, lost: 8, goalsFor: 40, goalsAgainst: 38, goalDifference: 2, points: 38, form: ['W', 'D', 'W', 'D', 'L'] },
        { position: 9, team: 'Western United', played: 26, won: 9, drawn: 5, lost: 12, goalsFor: 31, goalsAgainst: 36, goalDifference: -5, points: 32, form: ['L', 'L', 'W', 'L', 'D'] },
        { position: 10, team: 'Newcastle Jets', played: 26, won: 8, drawn: 6, lost: 12, goalsFor: 30, goalsAgainst: 38, goalDifference: -8, points: 30, form: ['W', 'L', 'D', 'L', 'L'] },
        { position: 11, team: 'Brisbane Roar', played: 26, won: 5, drawn: 10, lost: 11, goalsFor: 24, goalsAgainst: 38, goalDifference: -14, points: 25, form: ['L', 'D', 'D', 'L', 'D'] },
        { position: 12, team: 'Western Sydney Wanderers', played: 26, won: 5, drawn: 8, lost: 13, goalsFor: 25, goalsAgainst: 42, goalDifference: -17, points: 23, form: ['L', 'D', 'L', 'L', 'W'] },
      ];
      lastUpdated = new Date();
      loading = false;
    } catch (e) {
      console.error('Error fetching ladder data:', e);
      error = true;
      loading = false;
    }
  });

  function getFormClass(result: string): string {
    switch (result) {
      case 'W': return 'bg-green-600 text-white';
      case 'D': return 'bg-amber-500 text-white';
      case 'L': return 'bg-red-600 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  }

  function getTeamRowClass(team: string): string {
    return team === highlightedTeam
      ? 'bg-purple-50 hover:bg-purple-100 transition-colors duration-300 border-l-4 border-purple-600'
      : 'hover:bg-gray-50 transition-colors duration-300';
  }

  function getSortIndicator(column: string): string {
    if (sortBy !== column) return '';
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  function getColumnClass(column: string): string {
    return sortBy === column
      ? 'text-purple-800 cursor-pointer font-bold transition-colors duration-300'
      : 'text-gray-500 cursor-pointer hover:text-purple-600 transition-colors duration-300';
  }

  function refreshData() {
    loading = true;
    setTimeout(() => {
      // Randomize form to simulate data change
      standings = standings.map(team => ({
        ...team,
        form: team.form
          .slice(1)
          .concat(['W', 'D', 'L'][Math.floor(Math.random() * 3)])
      }));
      lastUpdated = new Date();
      loading = false;
    }, 800);
  }
</script>

<SEO
  title="A-League Ladder | Perth Glory News"
  description="Current A-League standings and table positions with Perth Glory highlighted"
  keywords="Perth Glory, A-League, standings, ladder, table, points, football"
/>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
    <div class="p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-2 text-purple-800 flex items-center">
            <svg class="w-8 h-8 mr-2 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            A-League Ladder
          </h1>
          <p class="text-gray-600">Current league standings with {highlightedTeam} highlighted</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search teams..."
              class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              bind:value={filterText}
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-2 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {#if filterText}
              <button
                class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                on:click={() => filterText = ''}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>

          <button
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-md"
            on:click={refreshData}
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {#if loading}
        <div class="animate-pulse" in:fade={{ duration: 200 }}>
          <div class="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div class="space-y-3">
            {#each Array(12) as _, i}
              <div class="grid grid-cols-11 gap-4">
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-2"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
                <div class="h-6 bg-gray-200 rounded col-span-1"></div>
              </div>
            {/each}
          </div>
        </div>
      {:else if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-md" in:fly={{ y: 20, duration: 400 }}>
          <div class="flex items-center">
            <svg class="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="font-medium">Sorry, we couldn't load the ladder data. Please try again later.</p>
          </div>
          <button
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            on:click={() => {
              loading = true;
              error = false;
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
          >
            Retry
          </button>
        </div>
      {:else}
        {#if filteredStandings.length === 0}
          <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-5 rounded-md" in:fly={{ y: 20, duration: 400 }}>
            <div class="flex items-center">
              <svg class="h-5 w-5 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="font-medium">No teams match your search criteria.</p>
            </div>
            <button
              class="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              on:click={() => filterText = ''}
            >
              Clear Search
            </button>
          </div>
        {:else}
          <div class="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider {getColumnClass('position')}" on:click={() => toggleSort('position')}>
                    <div class="flex items-center">
                      Pos {getSortIndicator('position')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider {getColumnClass('team')}" on:click={() => toggleSort('team')}>
                    <div class="flex items-center">
                      Team {getSortIndicator('team')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('played')}" on:click={() => toggleSort('played')}>
                    <div class="flex items-center justify-center">
                      Pld {getSortIndicator('played')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('won')}" on:click={() => toggleSort('won')}>
                    <div class="flex items-center justify-center">
                      W {getSortIndicator('won')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('drawn')}" on:click={() => toggleSort('drawn')}>
                    <div class="flex items-center justify-center">
                      D {getSortIndicator('drawn')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('lost')}" on:click={() => toggleSort('lost')}>
                    <div class="flex items-center justify-center">
                      L {getSortIndicator('lost')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('goalsFor')}" on:click={() => toggleSort('goalsFor')}>
                    <div class="flex items-center justify-center">
                      GF {getSortIndicator('goalsFor')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('goalsAgainst')}" on:click={() => toggleSort('goalsAgainst')}>
                    <div class="flex items-center justify-center">
                      GA {getSortIndicator('goalsAgainst')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('goalDifference')}" on:click={() => toggleSort('goalDifference')}>
                    <div class="flex items-center justify-center">
                      GD {getSortIndicator('goalDifference')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider {getColumnClass('points')}" on:click={() => toggleSort('points')}>
                    <div class="flex items-center justify-center">
                      Pts {getSortIndicator('points')}
                    </div>
                  </th>
                  <th scope="col" class="sticky top-0 z-10 bg-gray-50 px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wider">
                    <div class="flex items-center justify-center">
                      Form
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each filteredStandings as team, i (team.team)}
                  <tr
                    class={getTeamRowClass(team.team)}
                    in:fly={{ y: 10, duration: 300, delay: i * 50, easing: quintOut }}
                  >
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div class="flex items-center">
                        <span class={team.position <= 6 ? 'text-green-600 font-semibold' : ''}>
                          {team.position}
                        </span>
                        {#if team.position <= 6}
                          <span class="ml-1 w-2 h-2 rounded-full bg-green-500" title="Finals qualification position"></span>
                        {/if}
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        {#if !imageError[team.team]}
                          <img
                            src="/images/teams/{team.team.toLowerCase().replace(/ /g, '-')}.png"
                            alt={`${team.team} logo`}
                            class="h-7 w-7 mr-3 rounded-full shadow border border-gray-200 transition-transform duration-300 hover:scale-110"
                            on:error={() => handleImageError(team.team)}
                          />
                        {:else}
                          <div class="h-7 w-7 mr-3 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                            {team.team.charAt(0)}
                          </div>
                        {/if}
                        <div>
                          <span class={team.team === 'Perth Glory' ? 'font-semibold text-purple-800' : 'text-gray-900'}>
                            {team.team}
                          </span>
                          {#if team.team === 'Perth Glory'}
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Home
                            </span>
                          {/if}
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.played}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.won}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.drawn}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.lost}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.goalsFor}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.goalsAgainst}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm">
                      <span class={
                        team.goalDifference > 0 ? 'text-green-600 font-medium' :
                        team.goalDifference < 0 ? 'text-red-600 font-medium' :
                        'text-gray-500'
                      }>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <span class={
                        team.team === highlightedTeam ? 'text-purple-800 font-bold text-lg' :
                        team.position <= 3 ? 'text-green-700 font-semibold' : ''
                      }>
                        {team.points}
                      </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-center">
                      <div class="flex justify-center space-x-1">
                        {#each team.form as result, j}
                          <div
                            class={`w-6 h-6 flex items-center justify-center rounded-full ${getFormClass(result)} text-xs font-medium shadow-sm hover:scale-110 transition-transform duration-300`}
                            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                            in:fly={{ x: -5, duration: 300, delay: 300 + j * 100 }}
                          >
                            {result}
                          </div>
                        {/each}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex flex-wrap justify-between items-center">
              <div>
                <p class="font-medium text-gray-700 mb-3">Key:</p>
                <div class="flex flex-wrap gap-x-6 gap-y-2">
                  <div class="flex items-center">
                    <div class="w-5 h-5 rounded-full bg-green-600 mr-2 flex items-center justify-center text-white text-xs font-medium">W</div>
                    <span class="text-sm text-gray-700">Win</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 rounded-full bg-amber-500 mr-2 flex items-center justify-center text-white text-xs font-medium">D</div>
                    <span class="text-sm text-gray-700">Draw</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 rounded-full bg-red-600 mr-2 flex items-center justify-center text-white text-xs font-medium">L</div>
                    <span class="text-sm text-gray-700">Loss</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span class="text-sm text-gray-700">Finals Qualification</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 rounded-sm bg-purple-50 border-l-4 border-purple-600 mr-2"></div>
                    <span class="text-sm text-gray-700">Perth Glory</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 md:mt-0">
                <button
                  class="text-sm text-purple-700 hover:text-purple-900 flex items-center bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm hover:bg-purple-50 transition-colors"
                  on:click={() => {
                    sortBy = 'position';
                    sortOrder = 'asc';
                    sortStandings();
                  }}
                >
                  <svg class="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  Reset order
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 border-t pt-4 text-sm text-gray-600 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p><strong>Last updated:</strong> {lastUpdated.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p class="mt-1">Data source: A-League official statistics</p>
            </div>
            <div class="flex items-center gap-2">
              <a
                href="/news"
                class="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Latest News
              </a>
              <button
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow"
                on:click={refreshData}
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }

  @media (max-width: 768px) {
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
    }
  }
</style>
