<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/stores';
  import { fetchNewsArticle } from '$lib/services/newsService';
  import type { NewsItem } from '$lib/types';

  let article: NewsItem | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      loading = true;
      article = await fetchNewsArticle($page.params.id);
      
      if (!article) {
        error = 'Article not found';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load article';
      console.error('Error in onMount:', e);
    } finally {
      loading = false;
    }
  });

  function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    img.src = 'https://www.perthglory.com.au/sites/per/files/styles/image_1200x/public/2023-11/231104%20PERvWUN%20MG%20%2813%20of%2082%29.jpg';
  }
</script>

<svelte:head>
  {#if article}
    <title>{article.title} | Perth Glory News</title>
    <meta name="description" content={article.summary} />
  {:else}
    <title>Article | Perth Glory News</title>
  {/if}
</svelte:head>

<div class="article-page">
  <main class="article-page__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {#if loading}
      <div class="article-page__loader flex flex-col justify-center items-center h-64" in:fade={{ duration: 200 }}>
        <div class="article-page__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        <p class="mt-4 text-purple-600 font-medium">Loading article...</p>
      </div>
    {:else if error}
      <div class="article-page__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fly={{ y: 20, duration: 400 }}>
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-lg font-medium mb-2">{error}</p>
        <a 
          href="/"
          class="inline-block mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
        >
          Back to News
        </a>
      </div>
    {:else if article}
      <article class="article-page__content max-w-4xl mx-auto" in:fly={{ y: 50, duration: 1000 }}>
        <header class="article-page__header mb-8">
          <div class="flex items-center gap-4 mb-4">
            <a 
              href="/"
              class="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to News
            </a>
            <span class="text-gray-400">|</span>
            <time class="text-gray-500">{article.date}</time>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {article.category}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {article.title}
          </h1>
        </header>

        {#if article.imageUrl}
          <div class="article-page__image-container relative aspect-video mb-8 rounded-2xl overflow-hidden bg-purple-50">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              class="absolute inset-0 w-full h-full object-cover"
              on:error={handleImageError}
            />
          </div>
        {/if}

        <div class="article-page__content prose prose-purple max-w-none">
          {@html article.content}
        </div>
      </article>
    {/if}
  </main>
</div>

<style>
  .article-page {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .article-page__spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  :global(.prose) {
    max-width: none;
  }

  :global(.prose img) {
    border-radius: 1rem;
    margin: 2rem auto;
  }

  :global(.prose a) {
    color: theme(colors.purple.600);
    text-decoration: none;
  }

  :global(.prose a:hover) {
    color: theme(colors.purple.700);
    text-decoration: underline;
  }
</style>