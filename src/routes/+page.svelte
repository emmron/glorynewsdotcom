<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { format } from 'date-fns';
  import type { Article } from '../types/article';
  import { fade, fly } from 'svelte/transition';

  interface NewsResponse {
    success: boolean;
    articles: Article[];
    error?: string;
  }

  let articles: Article[] = [];
  let loading = true;
  let error: string | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let lastRefreshed: Date | null = null;
  let isAutoRefreshing = false;

  async function fetchNews(retry = 0): Promise<void> {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: NewsResponse = await response.json();

      if (data.success && Array.isArray(data.articles)) {
        articles = data.articles;
        lastRefreshed = new Date();
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (e) {
      console.error('Error fetching news:', e);
      error = e instanceof Error ? e.message : 'Failed to load articles';

      // Implement retry logic
      if (retry < MAX_RETRIES) {
        retryCount = retry + 1;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retry)));
        await fetchNews(retry + 1);
      }
    } finally {
      loading = false;
    }
  }

  function startAutoRefresh() {
    // Auto-refresh every 15 minutes (same as the original cron job)
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

    isAutoRefreshing = true;

    refreshInterval = setInterval(() => {
      fetchNews();
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
    fetchNews();
    startAutoRefresh();
  });

  onDestroy(() => {
    stopAutoRefresh();
  });

  function formatDate(date: string | Date): string {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
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

<svelte:head>
  <title>Perth Glory News - Latest Updates</title>
  <meta name="description" content="Latest news and updates about Perth Glory Football Club" />
  <meta property="og:title" content="Perth Glory News - Latest Updates" />
  <meta property="og:description" content="Stay up to date with the latest Perth Glory football news and updates" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white">
  <main class="container mx-auto px-4 py-8">
    <h1
      class="text-5xl font-bold text-purple-900 mb-6 text-center"
      in:fly={{ y: -20, duration: 500 }}
    >
      Perth Glory News
    </h1>

    <div class="flex justify-center items-center mb-6 text-sm">
      <button
        class="px-4 py-2 rounded-md {isAutoRefreshing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} hover:opacity-90 transition-colors"
        on:click={toggleAutoRefresh}
      >
        {isAutoRefreshing ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
      </button>
      {#if lastRefreshed}
        <div class="ml-4 text-gray-600">
          Last updated: {formatRefreshTime(lastRefreshed)}
        </div>
      {/if}
      {#if !loading}
        <button
          class="ml-4 px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors"
          on:click={() => fetchNews()}
        >
          Refresh Now
        </button>
      {/if}
    </div>

    {#if loading}
      <div
        class="flex flex-col justify-center items-center min-h-[200px]"
        in:fade
      >
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
        <p class="mt-4 text-purple-700">Loading latest news{'.'.repeat(retryCount + 1)}</p>
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
          on:click={() => { loading = true; error = null; fetchNews(); }}
        >
          Retry
        </button>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        in:fade={{ duration: 300 }}
      >
        {#each articles as article, i}
          <article
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            in:fly={{ y: 20, duration: 300, delay: i * 100 }}
          >
            {#if article.featuredImage}
              <div class="relative aspect-video overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  class="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  loading={i < 6 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            {/if}

            <div class="p-6">
              <div class="flex items-center text-sm text-gray-500 mb-2">
                <time datetime={new Date(article.publishDate).toISOString()}>
                  {formatDate(article.publishDate)}
                </time>
                {#if article.sourceName}
                  <span class="mx-2">·</span>
                  <span>{article.sourceName}</span>
                {/if}
              </div>

              <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group">
                <a
                  href="/article/{article.slug}"
                  class="hover:text-purple-600 transition-colors"
                >
                  {article.title}
                </a>
              </h2>

              <p class="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

              <div class="flex justify-between items-center">
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
