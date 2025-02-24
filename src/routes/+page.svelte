<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import type { Article } from '../types/article';

  let articles: Article[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();

      if (data.success) {
        articles = data.articles;
      } else {
        error = data.error;
      }
    } catch (e) {
      error = 'Failed to load articles';
    } finally {
      loading = false;
    }
  });
</script>

<style>
  :global(body) {
    background-color: #faf5ff;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
  }

  :global(.line-clamp-2) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.line-clamp-3) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(img) {
    transition: transform 0.3s ease;
  }

  :global(img:hover) {
    transform: scale(1.05);
  }

  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

<svelte:head>
  <title>Perth Glory News - Latest Updates</title>
  <meta name="description" content="Latest news and updates about Perth Glory Football Club" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-5xl font-bold text-purple-900 mb-8 text-center">Perth Glory News</h1>

    {#if loading}
      <div class="flex justify-center items-center min-h-[200px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-900"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error! </strong>
        <span class="block sm:inline">{error}</span>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each articles as article}
          <article class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {#if article.featuredImage}
              <div class="relative aspect-video">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  class="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            {/if}
            <div class="p-6">
              <div class="flex items-center text-sm text-gray-500 mb-2">
                <time datetime={new Date(article.publishDate).toISOString()}>
                  {format(new Date(article.publishDate), 'MMM d, yyyy')}
                </time>
                <span class="mx-2">·</span>
                <span>{article.sourceName}</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-purple-600">
                <a href="/article/{article.slug}">{article.title}</a>
              </h2>
              <p class="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
              <div class="flex justify-between items-center">
                <a
                  href="/article/{article.slug}"
                  class="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
                >
                  Read More
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

<style>
  :global(body) {
    @apply bg-purple-50;
  }
</style>
