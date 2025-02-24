<script lang="ts">
  import { format } from 'date-fns';
  import type { Article } from '../../../types/article';
  import { page } from '$app/stores';

  export let data: { article: Article };
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <article class="bg-white rounded-lg shadow-lg overflow-hidden">
    {#if data.article.featuredImage}
      <div class="relative h-[400px]">
        <img
          src={data.article.featuredImage}
          alt={data.article.title}
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    {/if}

    <div class="p-8">
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{data.article.title}</h1>
        <div class="flex items-center text-gray-600 text-sm">
          <time datetime={data.article.publishDate.toISOString()}>
            {format(new Date(data.article.publishDate), 'MMMM d, yyyy')}
          </time>
          <span class="mx-2">·</span>
          <span>{data.article.sourceName}</span>
          {#if data.article.readTime}
            <span class="mx-2">·</span>
            <span>{data.article.readTime} min read</span>
          {/if}
        </div>
      </header>

      <div class="prose prose-lg max-w-none">
        {data.article.content}
      </div>

      {#if data.article.tags && data.article.tags.length > 0}
        <div class="mt-8 pt-8 border-t">
          <div class="flex flex-wrap gap-2">
            {#each data.article.tags as tag}
              <a
                href={`/tags/${tag}`}
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                #{tag}
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <footer class="mt-8 pt-8 border-t text-sm text-gray-600">
        <p>
          Source: <a href={data.article.sourceUrl} class="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {data.article.sourceName}
          </a>
        </p>
        <p class="mt-2">
          Last updated: {format(new Date(data.article.lastModified || data.article.scrapedAt), 'MMMM d, yyyy HH:mm')}
        </p>
      </footer>
    </div>
  </article>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }
</style> 