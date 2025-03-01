<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/stores';

  // Get data from the load function
  export let data;

  // Extract article and error from data
  $: article = data.article;
  $: error = data.error || '';
  $: success = data.success;

  function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    img.src = '/images/default-news.jpg';
  }

  // Format date for display
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }
</script>

<svelte:head>
  {#if article}
    <title>{article.title} | Perth Glory News</title>
    <meta name="description" content={article.summary} />
    <meta property="og:title" content={article.title} />
    <meta property="og:description" content={article.summary} />
    {#if article.imageUrl}
      <meta property="og:image" content={article.imageUrl} />
    {/if}
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://perthglorynews.com/news/${article.id}`} />
  {:else}
    <title>Article | Perth Glory News</title>
  {/if}
</svelte:head>

<div class="article-page">
  <main class="article-page__main container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {#if !success && error}
      <div class="article-page__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fly={{ y: 20, duration: 400 }}>
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-lg font-medium mb-2">{error}</p>
        <a
          href="/news"
          class="inline-block mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
        >
          Back to News
        </a>
      </div>
    {:else if article}
      <article class="article-page__content max-w-4xl mx-auto" in:fly={{ y: 50, duration: 1000 }}>
        <header class="article-page__header mb-8">
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <a
              href="/news"
              class="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to News
            </a>
            <span class="text-gray-400">|</span>
            <time class="text-gray-500" datetime={article.publishDate || article.date}>
              {formatDate(article.publishDate || article.date)}
            </time>
            {#if article.category}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {article.category}
              </span>
            {/if}
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            {article.title}
          </h1>
          {#if article.author}
            <div class="text-gray-600">
              By {article.author}
            </div>
          {/if}
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

        {#if article.tags && article.tags.length > 0}
          <div class="mt-8 pt-8 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div class="flex flex-wrap gap-2">
              {#each article.tags as tag}
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              {/each}
            </div>
          </div>
        {/if}

        {#if article.sourceUrl}
          <div class="mt-8 text-sm text-gray-500">
            Source: <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">{article.source || 'Original Article'}</a>
          </div>
        {/if}
      </article>
    {:else}
      <div class="article-page__loader flex flex-col justify-center items-center h-64" in:fade={{ duration: 200 }}>
        <div class="article-page__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        <p class="mt-4 text-purple-600 font-medium">Loading article...</p>
      </div>
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
    font-size: 1.1rem;
    line-height: 1.8;
  }

  :global(.prose img) {
    border-radius: 1rem;
    margin: 2rem auto;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  :global(.prose a) {
    color: #9333EA;
    text-decoration: none;
  }

  :global(.prose a:hover) {
    color: #6b21a8;
    text-decoration: underline;
  }

  :global(.prose h2) {
    font-size: 1.75rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #4B5563;
  }

  :global(.prose h3) {
    font-size: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #4B5563;
  }

  :global(.prose blockquote) {
    border-left: 4px solid #9333EA;
    padding-left: 1rem;
    color: #6B7280;
    font-style: italic;
  }
</style>