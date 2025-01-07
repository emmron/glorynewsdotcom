<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { fetchGloryNews } from '$lib/services/newsService';
  import { fetchALeagueLadder } from '$lib/services/ladderService';
  import type { NewsItem, LeagueLadder } from '$lib/types';

  let news: NewsItem[] = [];
  let displayedNews: NewsItem[] = [];
  let ladder: LeagueLadder | null = null;
  let loading = true;
  let error = '';
  let currentPage = 1;
  const itemsPerPage = 6;

  onMount(async () => {
    try {
      loading = true;
      const [newsData, ladderData] = await Promise.all([
        fetchGloryNews(),
        fetchALeagueLadder()
      ]);
      news = newsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      ladder = ladderData;
      updateDisplayedNews();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load data';
      console.error('Error in onMount:', e);
    } finally {
      loading = false;
    }
  });

  function updateDisplayedNews() {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    displayedNews = news.slice(startIndex, endIndex);
  }

  function loadMore() {
    if (currentPage * itemsPerPage < news.length) {
      currentPage++;
      updateDisplayedNews();
    }
  }

  $: hasMorePages = news.length > currentPage * itemsPerPage;
</script>

<svelte:head>
  <title>Perth Glory News</title>
  <meta name="description" content="Latest news and updates from Perth Glory Football Club" />
</svelte:head>

<div class="news-page">
  <main class="news-page__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="news-page__header-container max-w-4xl mx-auto w-full" in:fly="{{ y: 50, duration: 1000 }}">
      <header class="news-page__header text-center mb-12">
        <h1 class="news-page__title text-4xl md:text-5xl font-bold text-purple-900 tracking-tight">
          Latest News
        </h1>
        <p class="news-page__subtitle text-gray-600 mt-2 text-lg">
          Stay up to date with Perth Glory
        </p>
      </header>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <section class="news-page__section lg:col-span-3">
        {#if loading}
          <div class="news__loader flex flex-col justify-center items-center h-64" in:fade>
            <div class="news__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p class="mt-4 text-purple-600 font-medium">Loading news...</p>
          </div>
        {:else if error}
          <div class="error-message text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fade>
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-lg font-medium mb-2">{error}</p>
            <button 
              class="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
              on:click={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        {:else}
          <div class="news__grid grid grid-cols-1 sm:grid-cols-2 gap-8">
            {#each displayedNews as article (article.id)}
              <article class="news-card bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md" in:fade>
                <div class="news-card__image-container relative aspect-video bg-purple-50">
                  {#if article.imageUrl}
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      class="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div class="absolute bottom-4 left-4">
                      <span class="inline-block px-3 py-1 bg-purple-600/90 text-white text-sm font-medium rounded-full">
                        {article.category}
                      </span>
                    </div>
                  {:else}
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-purple-600 font-medium">{article.category}</span>
                    </div>
                  {/if}
                </div>
                <div class="news-card__content p-6">
                  <div class="news-card__meta flex items-center gap-4 mb-3">
                    <time class="text-sm text-gray-500">{article.date}</time>
                  </div>
                  <h2 class="news-card__title text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <a href="/news/{article.id}" class="hover:text-purple-600 transition-colors">
                      {article.title}
                    </a>
                  </h2>
                  <p class="news-card__summary text-gray-600 line-clamp-3">
                    {article.summary}
                  </p>
                  <a 
                    href="/news/{article.id}" 
                    class="inline-block mt-4 text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    Read More →
                  </a>
                </div>
              </article>
            {/each}
          </div>
          
          {#if hasMorePages}
            <div class="flex justify-center mt-12">
              <button 
                class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                on:click={loadMore}
              >
                Load More News
              </button>
            </div>
          {/if}
        {/if}
      </section>

      <aside class="lg:col-span-1">
        <div class="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">A-League Ladder</h2>
          {#if ladder}
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr class="text-left text-xs font-medium text-gray-500 uppercase">
                    <th class="px-2 py-2">Pos</th>
                    <th class="px-2 py-2">Team</th>
                    <th class="px-2 py-2 text-center">P</th>
                    <th class="px-2 py-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  {#each ladder.teams as team}
                    <tr class="hover:bg-purple-50 {team.teamName === 'Perth Glory' ? 'bg-purple-50' : ''}">
                      <td class="px-2 py-2 text-sm">
                        <span class="{team.position <= 6 ? 'text-green-600' : team.position >= ladder.teams.length ? 'text-red-600' : ''} font-medium">
                          {team.position}
                        </span>
                      </td>
                      <td class="px-2 py-2 text-sm font-medium text-gray-900">{team.teamName}</td>
                      <td class="px-2 py-2 text-sm text-center text-gray-500">{team.played}</td>
                      <td class="px-2 py-2 text-sm text-center font-medium text-gray-900">{team.points}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <div class="mt-4 text-xs text-gray-500">
              Last updated: {new Date(ladder.lastUpdated).toLocaleString('en-AU')}
            </div>
            <div class="mt-2 flex gap-4 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-gray-600">Finals</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                <span class="text-gray-600">Relegation</span>
              </div>
            </div>
          {:else}
            <div class="text-gray-500 text-sm">Loading ladder...</div>
          {/if}
        </div>
      </aside>
    </div>
  </main>
</div>

<style>
  .news-page {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .news__spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
