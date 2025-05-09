<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { format } from 'date-fns';
  import type { Article } from '../types/article';
  import { fade, fly } from 'svelte/transition';
  import { invalidateAll } from '$app/navigation';
  import SEO from '$lib/components/SEO.svelte';

  // Define the expected shape of the data prop
  export let data: { articles: Article[] };

  let articles: Article[] = [];
  let loading = false;
  let error: string | null = null;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let lastRefreshed: Date | null = null;
  let isAutoRefreshing = true;
  let loadingRefresh = false;

  // Sync data from load function
  $: {
    articles = data.articles || [];

    // If we have articles, update lastRefreshed
    if (articles.length > 0 && !lastRefreshed) {
      lastRefreshed = new Date();
    }
  }

  async function refreshData(): Promise<void> {
    loadingRefresh = true;
    try {
      // Use invalidateAll to refresh all data
      await invalidateAll();
      lastRefreshed = new Date();
    } catch (e) {
      console.error('Error refreshing news:', e);
    } finally {
      loadingRefresh = false;
    }
  }

  function startAutoRefresh() {
    // Auto-refresh every 15 minutes
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

    isAutoRefreshing = true;

    refreshInterval = setInterval(() => {
      refreshData();
    }, REFRESH_INTERVAL);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    isAutoRefreshing = false;
  }

  function toggleAutoRefresh() {
    if (isAutoRefreshing) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  }

  onMount(() => {
    startAutoRefresh();
  });

  onDestroy(() => {
    stopAutoRefresh();
  });

  function formatDate(date: string | Date): string {
    try {
      if (typeof date === 'string') {
        return format(new Date(date), 'MMM d, yyyy');
      } else if (date instanceof Date) {
        return format(date, 'MMM d, yyyy');
      } else {
        // Explicitly handle undefined or null, though type should prevent this
        if (date === null || date === undefined) {
          console.warn('formatDate received null or undefined date');
          return 'Date unavailable';
        }
        return 'Date unavailable';
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  }

  function formatRefreshTime(date: Date | null): string {
    if (!date) return 'Not yet refreshed';
    try {
      return format(date, 'h:mm:ss a');
    } catch {
      return 'Unknown';
    }
  }
</script>

<SEO
  title="Perth Glory News - Latest Updates and News"
  description="Stay up to date with the latest Perth Glory football news, match reports, player updates, and club announcements."
  keywords="Perth Glory, A-League, Football, Soccer, Perth Glory FC, Perth Glory News, Football News, A-League News"
  image={articles[0]?.featuredImage || ''}
/>

<div class="min-h-screen bg-gradient-to-b from-purple-100 to-white">
  <main class="container mx-auto px-4 py-8">
    <header class="text-center mb-8" in:fly={{ y: -20, duration: 500 }}>
      <h1 class="text-4xl md:text-5xl font-bold text-purple-900 mb-3">
        Perth Glory News
      </h1>
      <p class="text-gray-600">Your source for the latest Perth Glory FC updates</p>
    </header>

    <div class="flex flex-wrap justify-center items-center mb-6 text-sm gap-2">
      <button
        class="px-4 py-2 rounded-full {isAutoRefreshing ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-90 transition-colors"
        on:click={toggleAutoRefresh}
      >
        {isAutoRefreshing ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
      </button>
      {#if lastRefreshed}
        <div class="px-3 py-2 bg-white rounded-full shadow-sm text-gray-600">
          Last updated: {formatRefreshTime(lastRefreshed)}
        </div>
      {/if}
      <button
        class="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        on:click={refreshData}
        disabled={loading || loadingRefresh}
      >
        {#if loadingRefresh}
          <span class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        {/if}
        <span>{loadingRefresh ? 'Refreshing...' : 'Refresh Now'}</span>
      </button>
    </div>

    {#if loading && !loadingRefresh}
      <div
        class="flex flex-col justify-center items-center min-h-[200px]"
        in:fade
      >
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
        <p class="mt-4 text-purple-700">Loading latest news...</p>
      </div>
    {:else if error}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm"
        role="alert"
        in:fly={{ y: 20, duration: 500 }}
      >
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <strong class="font-medium">Error loading news:</strong>
          <span class="ml-2">{error}</span>
        </div>
        <button
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          on:click={refreshData}
        >
          Retry
        </button>
      </div>
    {:else if articles.length === 0}
      <div class="text-center p-8 bg-yellow-50 rounded-lg shadow-sm">
        <p class="text-yellow-800">No articles found. Please check back later.</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        in:fade={{ duration: 300 }}
      >
        {#each articles as article, i}
          <article
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            in:fly={{ y: 20, duration: 300, delay: Math.min(i * 100, 600) }}
          >
            {#if article.featuredImage}
              <div class="relative aspect-video overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  class="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  loading={i < 6 ? "eager" : "lazy"}
                  decoding="async"
                  width="600"
                  height="338"
                />
              </div>
            {/if}

            <div class="p-6 flex-grow flex flex-col">
              <div class="flex items-center text-sm text-gray-500 mb-2">
                <time datetime={typeof article.publishDate === 'string' ? article.publishDate : article.publishDate?.toISOString()}>
                  {formatDate(article.publishDate)}
                </time>
                {#if article.sourceName}
                  <span class="mx-2">·</span>
                  <span>{article.sourceName}</span>
                {/if}
              </div>

              <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                <a
                  href="/article/{article.slug}"
                  class="hover:text-purple-600 transition-colors"
                >
                  {article.title}
                </a>
              </h2>

              <p class="text-gray-600 mb-4 line-clamp-3 flex-grow">{article.excerpt}</p>

              <div class="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                <a
                  href="/article/{article.slug}"
                  class="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors group"
                >
                  Read More
                  <svg
                    class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                {#if article.readTime}
                  <span class="text-gray-500 text-sm">{article.readTime} min read</span>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </main>

  <footer class="mt-12 py-6 bg-purple-900 text-white text-center text-sm">
    <div class="container mx-auto px-4">
      <p>© {new Date().getFullYear()} Perth Glory News | Not affiliated with Perth Glory Football Club</p>
    </div>
  </footer>
</div>

<style lang="postcss">
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :global(body) {
    @apply bg-purple-50 min-h-screen font-sans antialiased;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
