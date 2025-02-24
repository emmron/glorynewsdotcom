<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { NewsItem } from '$lib/types';

  let news: NewsItem[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to load news');
      news = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load news';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Perth Glory News</title>
  <meta name="description" content="Latest news and updates from Perth Glory Football Club" />
</svelte:head>

<div class="news-page container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-purple-900 mb-8">Latest News</h1>

  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
      <p class="mt-4 text-purple-600">Loading news...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 text-red-600 p-6 rounded-lg">
      {error}
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each news as article}
        <a href="/news/{article.id}" class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <article class="p-6">
            {#if article.imageUrl}
              <img 
                src={article.imageUrl}
                alt={article.title}
                class="w-full h-48 object-cover rounded-lg mb-4"
                on:error={(e) => e.target.src = '/images/news-placeholder.jpg'}
              />
            {/if}
            <span class="text-sm text-purple-600 font-medium">{article.category}</span>
            <h2 class="text-xl font-semibold text-gray-900 mt-2 mb-3">{article.title}</h2>
            <p class="text-gray-600 text-sm">{article.summary}</p>
            <time class="block mt-4 text-sm text-gray-500">{article.date}</time>
          </article>
        </a>
      {/each}
    </div>
  {/if}
</div>