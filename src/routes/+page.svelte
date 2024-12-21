<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchGloryNews } from '$lib/services/newsService';
  import type { NewsItem } from '$lib/types';

  let latestNews: NewsItem[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      loading = true;
      latestNews = await fetchGloryNews();
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
      const news = await fetchGloryNews();
      latestNews = news;
      error = '';
    } catch {
      error = 'Failed to load news';
    } finally {
      loading = false;
    }
  };
</script>
<div class="news">
  <main class="news__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="news__header-container max-w-4xl mx-auto w-full">
      <header class="news__header text-center mb-12">
        <h1 class="news__title text-4xl md:text-5xl font-bold text-purple-900 tracking-tight">Perth Glory News</h1>
        <p class="news__subtitle text-gray-600 mt-2 text-lg">Official Updates from Glory HQ</p>
      </header>
    </div>
    
    <section class="news__section max-w-7xl mx-auto">
      <div class="news__content bg-white rounded-2xl shadow-sm p-8">
        <div class="news__content-header flex justify-between items-center border-b border-purple-200 pb-2 mb-8">
          <h2 class="news__content-title text-2xl md:text-3xl font-semibold text-purple-800">Latest Updates</h2>
          <a 
            href="https://www.perthglory.com.au/news" 
            target="_blank" 
            rel="noopener noreferrer"
            class="news__external-link btn-secondary text-sm"
          >
            Visit Official Site
          </a>
        </div>
        
        {#if loading}
          <div class="news__loader flex justify-center items-center h-64">
            <div class="news__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        {:else if error}
          <div class="news__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm">
            {error}
            <button 
              class="news__retry block mx-auto mt-4 text-sm underline"
              on:click={handleRetry}
            >
              Try Again
            </button>
          </div>
        {:else if latestNews.length === 0}
          <div class="news__empty text-center bg-gray-50 text-gray-600 py-8 rounded-lg shadow-sm">
            No news articles available at the moment.
          </div>
        {:else}
          <div class="news__grid">
            {#each latestNews as news}
              <article class="news-card">
                <div class="news-card__image-container">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    class="news-card__image"
                    on:error={(e) => {
                      if (e.currentTarget instanceof HTMLImageElement) {
                        e.currentTarget.src = '/images/placeholder-news.jpg';
                      }
                    }}
                  />
                </div>
                <div class="news-card__content">
                  <div class="news-card__meta">
                    <span class="news-card__category badge badge-purple text-xs">
                      {news.category}
                    </span>
                    <time class="news-card__date text-xs text-gray-500">{news.date}</time>
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
                    Read More
                    <svg class="news-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </article>
            {/each}
          </div>
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
  }

  :global(::selection) {
    background-color: #9333ea;
    color: white;
  }

  :global(::-webkit-scrollbar) {
    width: 12px;
  }

  :global(::-webkit-scrollbar-track) {
    background: #f1f1f1;
    border-radius: 6px;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #9333ea;
    border-radius: 6px;
    border: 3px solid #f1f1f1;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: #7928ca;
  }

  .news {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
    padding: 4rem 0;
  }

  .news__grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 3rem;
    justify-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .news__grid::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(147, 51, 234, 0.1) 0%, transparent 70%);
    pointer-events: none;
    filter: blur(60px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 640px) {
    .news__grid {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 3rem;
      padding: 3rem;
    }
  }

  @media (min-width: 768px) {
    .news__grid {
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 3.5rem;
    }
  }

  @media (min-width: 1024px) {
    .news__grid {
      grid-template-columns: repeat(3, minmax(320px, 1fr));
      gap: 4rem;
      padding: 4rem;
    }
  }

  @media (min-width: 1280px) {
    .news__grid {
      grid-template-columns: repeat(3, minmax(360px, 1fr));
      max-width: 1280px;
      gap: 4.5rem;
      padding: 4.5rem;
    }
  }

  .news-card {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 1.5rem;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.08), 
      0 2px 4px -1px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(147, 51, 234, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    width: 100%;
    max-width: 460px;
    position: relative;
    backdrop-filter: blur(10px);
    will-change: transform;
  }

  .news-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 
      0 25px 30px -8px rgba(0, 0, 0, 0.12),
      0 15px 15px -6px rgba(0, 0, 0, 0.06),
      0 0 0 2px rgba(147, 51, 234, 0.15);
  }

  .news-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.98) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .news-card:hover::after {
    opacity: 1;
  }

  .news-card__image-container {
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
    border-bottom: 2px solid rgba(147, 51, 234, 0.15);
  }

  .news-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1);
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    loading: lazy;
  }

  .news-card:hover .news-card__image {
    transform: scale(1.15);
  }

  .news-card__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 2.5rem;
    gap: 1.75rem;
    position: relative;
    z-index: 1;
    background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.9) 100%);
  }

  .news-card__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .news-card__title {
    font-size: 1.375rem;
    font-weight: 700;
    color: #111827;
    transition: color 0.3s ease;
    line-height: 1.45;
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  .news-card__link {
    text-decoration: none;
    background: linear-gradient(to right, #6d28d9, #9333ea);
    background-size: 0% 2px;
    background-position: 0 100%;
    background-repeat: no-repeat;
    transition: all 0.3s ease;
  }

  .news-card__link:hover {
    background-size: 100% 2px;
    color: #6d28d9;
  }

  .news-card__summary {
    color: #374151;
    font-size: 1rem;
    line-height: 1.75;
    margin-bottom: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .news-card__read-more {
    display: inline-flex;
    align-items: center;
    color: #6d28d9;
    font-weight: 600;
    margin-top: auto;
    padding: 1.25rem 0;
    font-size: 1rem;
    transition: all 0.3s ease;
    border-top: 1px solid rgba(147, 51, 234, 0.12);
    letter-spacing: 0.01em;
  }

  .news-card__read-more:hover {
    color: #5b21b6;
    padding-left: 0.75rem;
  }

  .news-card__icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-left: 0.5rem;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }

  .news-card__read-more:hover .news-card__icon {
    transform: translateX(0.75rem);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: all 0.3s ease;
  }

  .badge-purple {
    background: linear-gradient(135deg, rgba(109, 40, 217, 0.1), rgba(147, 51, 234, 0.1));
    color: #6d28d9;
    border: 1px solid rgba(147, 51, 234, 0.25);
  }

  .badge:hover {
    background: linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(147, 51, 234, 0.15));
    transform: scale(1.05);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
