<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { fetchGloryNews } from '$lib/services/newsService';
  import type { NewsItem } from '$lib/types';

  let allNews: NewsItem[] = [];
  let displayedNews: NewsItem[] = [];
  let loading = true;
  let error = '';
  let currentPage = 1;
  const itemsPerPage = 12;
  let searchQuery = '';
  let selectedCategory: string | null = null;

  $: filteredNews = allNews.filter(news => {
    const matchesSearch = searchQuery === '' || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || news.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  $: {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    displayedNews = filteredNews.slice(startIndex, endIndex);
  }

  $: categories = [...new Set(allNews.map(news => news.category))];

  onMount(async () => {
    try {
      loading = true;
      allNews = await fetchGloryNews();
    } catch (e) {
      error = 'Failed to load news';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  const handleRetry = async () => {
    try {
      loading = true;
      allNews = await fetchGloryNews();
      error = '';
    } catch {
      error = 'Failed to load news';
    } finally {
      loading = false;
    }
  };

  const loadMore = () => {
    if (currentPage * itemsPerPage < filteredNews.length) {
      currentPage++;
    }
  };

  const hasMorePages = () => currentPage * itemsPerPage < filteredNews.length;

  const resetFilters = () => {
    searchQuery = '';
    selectedCategory = null;
    currentPage = 1;
  };
</script>

<div class="news">
  <main class="news__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="news__header-container max-w-4xl mx-auto w-full" in:fly="{{ y: 50, duration: 1000 }}">
      <header class="news__header text-center mb-12">
        <h1 class="news__title text-4xl md:text-5xl font-bold text-purple-900 tracking-tight">
          Perth Glory News
        </h1>
        <p class="news__subtitle text-gray-600 mt-2 text-lg">
          Stay Updated with the Latest from Glory HQ
        </p>
      </header>

      <div class="news__filters bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-stretch">
          <div class="flex-1">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search news..."
              class="news__search w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            />
          </div>
          <div class="flex-1">
            <select
              bind:value={selectedCategory}
              class="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            >
              <option value={null}>All Categories</option>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          {#if searchQuery || selectedCategory}
            <button
              on:click={resetFilters}
              class="px-6 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-300"
            >
              Reset Filters
            </button>
          {/if}
        </div>
      </div>
    </div>
    
    <section class="news__section max-w-7xl mx-auto">
      <div class="news__content bg-white rounded-2xl shadow-sm p-8">
        {#if loading}
          <div class="news__loader flex flex-col justify-center items-center h-64" in:fade>
            <div class="news__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p class="mt-4 text-purple-600 font-medium">Loading latest news...</p>
          </div>
        {:else if error}
          <div class="news__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fade>
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
        {:else if displayedNews.length === 0}
          <div class="news__empty text-center bg-gray-50 text-gray-600 py-12 rounded-lg shadow-sm" in:fade>
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"/>
            </svg>
            <p class="text-xl font-medium mb-2">No news articles found</p>
            <p class="text-gray-500">Try adjusting your search or filters</p>
          </div>
        {:else}
          <div class="news__grid">
            {#each displayedNews as news (news.id)}
              <article class="news-card" in:fade="{{ duration: 500, delay: 200 }}">
                <div class="news-card__image-container">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    class="news-card__image"
                    loading="lazy"
                    on:error={(e) => {
                      if (e.currentTarget instanceof HTMLImageElement) {
                        e.currentTarget.src = '/images/placeholder-news.jpg';
                      }
                    }}
                  />
                  <div class="news-card__overlay"></div>
                </div>
                <div class="news-card__content">
                  <div class="news-card__meta">
                    <span class="news-card__category badge badge-purple">
                      {news.category}
                    </span>
                    <time class="news-card__date text-sm text-gray-500">{news.date}</time>
                  </div>
                  
                  <h3 class="news-card__title">
                    <a href="/news/{news.id}" class="news-card__link">
                      {@html news.title}
                    </a>
                  </h3>
                  
                  <p class="news-card__summary">{news.summary}</p>
                  
                  <a 
                    href="/news/{news.id}"
                    class="news-card__read-more"
                  >
                    Read Full Article
                    <svg class="news-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </a>
                </div>
              </article>
            {/each}
          </div>
          
          {#if hasMorePages()}
            <div class="news__load-more" in:fade="{{ duration: 300 }}">
              <button 
                class="load-more-button"
                on:click={loadMore}
              >
                Load More Articles
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </section>
  </main>
</div>

<style>
  :global(body) {
    background-color: #f8f9fa;
    min-height: 100vh;
    overflow-x: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  }

  :global(::selection) {
    background-color: #9333ea;
    color: white;
  }

  .news {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
    padding: 2rem 0;
    perspective: 1200px;
  }

  .news__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.5rem;
    justify-items: center;
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
  }

  @media (min-width: 640px) {
    .news__grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (min-width: 1024px) {
    .news__grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
    }
  }

  @media (min-width: 1280px) {
    .news__grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 3rem;
      padding: 3rem;
    }
  }

  .news-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 1.75rem;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.08), 
      0 2px 4px -1px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(147, 51, 234, 0.12);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    width: 100%;
    max-width: 480px;
    position: relative;
    backdrop-filter: blur(12px);
    will-change: transform;
  }

  .news-card:hover {
    transform: translateY(-8px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 2px rgba(147, 51, 234, 0.25);
  }

  .news-card__image-container {
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
  }

  .news-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1);
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .news-card:hover .news-card__image {
    transform: scale(1.1);
  }

  .news-card__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .news-card:hover .news-card__overlay {
    opacity: 1;
  }

  .news-card__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 2rem;
    gap: 1.5rem;
  }

  .news-card__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .news-card__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .news-card__link {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s ease;
  }

  .news-card__link:hover {
    color: #7c3aed;
  }

  .news-card__summary {
    color: #4b5563;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-card__read-more {
    display: inline-flex;
    align-items: center;
    color: #7c3aed;
    font-weight: 600;
    margin-top: auto;
    transition: all 0.3s ease;
  }

  .news-card__read-more:hover {
    color: #6d28d9;
    transform: translateX(4px);
  }

  .news-card__icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }

  .news-card__read-more:hover .news-card__icon {
    transform: translateX(4px);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .badge-purple {
    background-color: rgba(124, 58, 237, 0.1);
    color: #7c3aed;
  }

  .badge:hover {
    background-color: rgba(124, 58, 237, 0.15);
    transform: translateY(-1px);
  }

  .news__load-more {
    display: flex;
    justify-content: center;
    margin-top: 4rem;
  }

  .load-more-button {
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: white;
    font-weight: 600;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);
  }

  .load-more-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px -2px rgba(124, 58, 237, 0.3);
    background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
  }

  .news__loader {
    min-height: 300px;
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
