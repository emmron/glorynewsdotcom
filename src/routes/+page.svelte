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
    <!-- Enhanced Hero Section with Background Image -->
    <div class="relative overflow-hidden bg-purple-900 rounded-2xl shadow-xl mb-12">
      <div class="absolute inset-0 opacity-30 bg-pattern"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 opacity-90"></div>
      <div class="relative z-10 px-6 py-16 md:py-24 md:px-12 text-center">
        <div class="animate-pulse-slow inline-block mb-6 p-2 rounded-full bg-purple-700 bg-opacity-50">
          <div class="bg-purple-200 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Perth Glory News
        </h1>
        <p class="text-xl text-purple-200 max-w-2xl mx-auto mb-6">Your trusted source for the latest Perth Glory FC updates, match reports, and club news</p>
        <div class="w-24 h-1 bg-purple-400 mx-auto mb-8"></div>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="/ladder" class="px-6 py-3 bg-white text-purple-900 font-semibold rounded-full hover:bg-purple-100 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View League Ladder
            </span>
          </a>
          <a href="/forum" class="px-6 py-3 bg-purple-700 text-white font-semibold rounded-full hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300 border border-purple-500">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Join Fan Discussion
            </span>
          </a>
        </div>
      </div>
      <!-- Decorative elements -->
      <div class="absolute bottom-0 left-0 w-full h-6 bg-white opacity-10"></div>
      <div class="absolute -bottom-3 -left-3 w-24 h-24 rounded-full bg-purple-600 opacity-20"></div>
      <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-purple-400 opacity-20"></div>
    </div>

    <!-- Refined refresh controls -->
    <div class="flex flex-wrap justify-center items-center mb-10 text-sm gap-3">
      <div class="bg-white p-1 rounded-full shadow-md flex items-center">
        <button
          class="px-4 py-2 rounded-full {isAutoRefreshing ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-90 transition-colors flex items-center"
          on:click={toggleAutoRefresh}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isAutoRefreshing ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
        </button>
        {#if lastRefreshed}
          <div class="px-3 py-2 text-gray-600 ml-1">
            Last updated: {formatRefreshTime(lastRefreshed)}
          </div>
        {/if}
        <button
          class="ml-1 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          on:click={refreshData}
          disabled={loading || loadingRefresh}
        >
          {#if loadingRefresh}
            <span class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {/if}
          <span>{loadingRefresh ? 'Refreshing...' : 'Refresh Now'}</span>
        </button>
      </div>
    </div>

    <!-- Latest News Section with Enhanced Title -->
    <div class="relative text-center mb-10">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 inline-block relative">
        Latest News
        <div class="absolute -bottom-2 left-0 w-full h-1 bg-purple-500"></div>
      </h2>
      <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Stay updated with the latest Perth Glory FC news, match results, and player updates</p>
    </div>

    {#if loading && !loadingRefresh}
      <div
        class="flex flex-col justify-center items-center min-h-[300px]"
        in:fade
      >
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-800"></div>
        <p class="mt-6 text-purple-700 font-medium">Loading latest news...</p>
      </div>
    {:else if error}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg shadow-sm max-w-2xl mx-auto"
        role="alert"
        in:fly={{ y: 20, duration: 500 }}
      >
        <div class="flex items-center">
          <svg class="w-8 h-8 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong class="font-medium text-lg block mb-1">Error loading news</strong>
            <span class="text-red-600">{error}</span>
          </div>
        </div>
        <button
          class="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
          on:click={refreshData}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    {:else if articles.length === 0}
      <div class="text-center p-12 bg-yellow-50 rounded-xl shadow-sm max-w-2xl mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-yellow-800 text-lg font-medium">No articles found. Please check back later.</p>
        <p class="text-yellow-700 mt-2">We're working on bringing you the latest Perth Glory news.</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        in:fade={{ duration: 300 }}
      >
        {#each articles as article, i}
          <article
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2 group"
            in:fly={{ y: 20, duration: 300, delay: Math.min(i * 100, 600) }}
          >
            {#if article.featuredImage}
              <div class="relative aspect-video overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading={i < 6 ? "eager" : "lazy"}
                  decoding="async"
                  width="600"
                  height="338"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {#if article.sourceName}
                  <div class="absolute top-0 left-0 bg-purple-700 text-white text-xs px-3 py-1 m-3 rounded-md shadow-md">
                    {article.sourceName}
                  </div>
                {/if}
                <div class="absolute bottom-0 left-0 w-full p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span class="text-sm font-medium">Click to read full article</span>
                </div>
              </div>
            {/if}

            <div class="p-6 flex-grow flex flex-col">
              <div class="flex items-center text-sm text-gray-500 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time datetime={typeof article.publishDate === 'string' ? article.publishDate : article.publishDate?.toISOString()}>
                  {formatDate(article.publishDate)}
                </time>
                {#if article.readTime}
                  <span class="mx-2">·</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{article.readTime} min read</span>
                {/if}
              </div>

              <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors">
                <a
                  href="/article/{article.slug}"
                  class="hover:text-purple-600 transition-colors"
                >
                  {article.title}
                </a>
              </h2>

              <p class="text-gray-600 mb-5 line-clamp-3 flex-grow">{article.excerpt}</p>

              <a
                href="/article/{article.slug}"
                class="inline-flex items-center justify-between text-purple-600 font-medium hover:text-purple-700 transition-colors group-hover:text-purple-700 mt-auto pt-3 border-t border-gray-100 w-full"
              >
                <span>Read Full Article</span>
                <svg
                  class="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </article>
        {/each}
      </div>

      <!-- Newsletter signup section -->
      <div class="mt-16 bg-purple-800 rounded-xl shadow-xl overflow-hidden">
        <div class="relative px-6 py-12 md:py-16 md:px-12 text-center">
          <div class="absolute inset-0 opacity-10 bg-pattern"></div>
          <h3 class="text-2xl md:text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p class="text-purple-200 max-w-2xl mx-auto mb-8">Subscribe to our newsletter for the latest Perth Glory news, match updates, and exclusive content delivered to your inbox.</p>
          <form class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              class="px-4 py-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Email address"
            />
            <button type="button" class="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors shadow-md border border-purple-500">
              Subscribe Now
            </button>
          </form>
          <p class="text-purple-300 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    {/if}
  </main>

  <footer class="mt-16 py-8 bg-purple-900 text-white text-center text-sm">
    <div class="container mx-auto px-4">
      <p>© {new Date().getFullYear()} Perth Glory News | Not affiliated with Perth Glory Football Club</p>
      <p class="mt-2">Website by <a href="https://hoolahandigital.com.au" target="_blank" rel="noopener noreferrer" class="text-purple-300 hover:text-white transition-colors">hoolahandigital.com.au</a></p>
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

  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .bg-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  }
</style>
