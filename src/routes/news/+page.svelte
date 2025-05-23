<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  // Get data from the server
  export let data;

  // Extract data
  $: articles = data.articles || [];
  $: error = data.error || '';
  $: success = data.success;
  $: timestamp = data.timestamp;

  // Filter options
  let selectedTeam = 'all';
  let searchQuery = '';
  let sortOrder = 'newest';

  // Derive category/team list
  $: teams = ['all', ...Array.from(new Set(articles.map(article =>
    article.category.toLowerCase().includes('glory') ? 'Perth Glory' : article.category
  )))].sort();

  // Filter and sort articles
  $: filteredArticles = articles
    .filter(article => {
      // Match team/category filter
      const teamMatch = selectedTeam === 'all' ||
        article.category.toLowerCase().includes(selectedTeam.toLowerCase()) ||
        (selectedTeam === 'Perth Glory' && article.category.toLowerCase().includes('glory'));

      // Match search query
      const searchMatch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return teamMatch && searchMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishDate || a.date);
      const dateB = new Date(b.publishDate || b.date);

      return sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  function formatDate(dateString) {
    const date = new Date(dateString);

    // Check if date is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Check if date is yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                        date.getMonth() === yesterday.getMonth() &&
                        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otherwise show the date
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Handle image loading errors
  function handleImageError(event) {
    const img = event.currentTarget;
    img.src = '/images/default-news.jpg';
  }
</script>

<svelte:head>
  <title>Latest Football News | Perth Glory News</title>
  <meta name="description" content="Stay updated with the latest football news from Perth Glory and A-League teams" />
</svelte:head>

<div class="news-page min-h-screen bg-gradient-to-b from-purple-50 to-white">
  <div class="container mx-auto px-4 py-12">
    <header class="mb-12 text-center" in:fly={{ y: -20, duration: 800 }}>
      <h1 class="text-4xl md:text-5xl font-bold text-purple-900 mb-4">Latest Football News</h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">Stay up to date with the latest news from Perth Glory and all A-League teams.</p>
    </header>

    <div class="mb-8 bg-white rounded-lg shadow-sm p-4" in:slide={{ duration: 400 }}>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Team Filter -->
        <div>
          <label for="team-filter" class="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <select
            id="team-filter"
            bind:value={selectedTeam}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            {#each teams as team}
              <option value={team}>{team === 'all' ? 'All Teams' : team}</option>
            {/each}
          </select>
        </div>

        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search news..."
            bind:value={searchQuery}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <!-- Sort Order -->
        <div>
          <label for="sort-order" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="sort-order"
            bind:value={sortOrder}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>

    {#if !success && error}
      <div class="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm" in:fade>
        <p class="text-lg font-semibold mb-2">Error loading news</p>
        <p>{error}</p>
        <button
          class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          on:click={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    {:else if filteredArticles.length === 0}
      <div class="text-center py-16 bg-gray-50 rounded-lg" in:fade>
        {#if searchQuery || selectedTeam !== 'all'}
          <p class="text-lg text-gray-600">No articles match your current filters.</p>
          <button
            class="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
            on:click={() => { searchQuery = ''; selectedTeam = 'all'; }}
          >
            Clear Filters
          </button>
        {:else}
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p class="mt-4 text-purple-600">Loading news...</p>
        {/if}
      </div>
    {:else}
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {#each filteredArticles as article (article.id)}
          <a
            href="/news/{article.id}"
            class="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-2 border border-gray-100"
            in:fade={{ duration: 300 }}
            animate:flip={{ duration: 300, easing: quintOut }}
          >
            <article class="p-0 flex flex-col h-full">
              <div class="relative aspect-[16/9] bg-purple-100 overflow-hidden">
                {#if article.imageUrl}
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    on:error={handleImageError}
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                    <span class="text-purple-300 text-4xl font-bold">PGN</span>
                  </div>
                {/if}

                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                {#if article.category}
                  <span class="absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full bg-purple-700 text-white font-medium shadow-md">
                    {article.category}
                  </span>
                {/if}

                <time
                  class="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-md bg-black/60 text-white font-medium"
                  datetime={article.publishDate || article.date}
                >
                  {formatDate(article.publishDate || article.date)}
                </time>
              </div>

              <div class="p-6 flex flex-col flex-grow">
                <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-800 transition-colors">{article.title}</h2>
                <p class="text-gray-600 text-sm mb-5 line-clamp-3 flex-grow">{article.summary}</p>

                <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span class="text-xs text-gray-500">Perth Glory News</span>
                  </div>

                  <span class="inline-flex items-center text-purple-700 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Read More
                    <svg class="w-4 h-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </a>
        {/each}
      </div>

      {#if timestamp}
        <div class="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date(timestamp).toLocaleString('en-AU')}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* Line clamp utilities */
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

  /* Add smooth scrolling to the page */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>