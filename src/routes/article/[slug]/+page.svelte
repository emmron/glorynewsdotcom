<script lang="ts">
  import { page } from '$app/stores';
  import SEO from '$lib/components/SEO.svelte';
  import { onMount } from 'svelte';
  import { formatDistance, format } from 'date-fns';
  import CommentSection from '$lib/components/CommentSection.svelte';
  import type { Article } from '../../../types/article';
  import ClubFilter from '$lib/components/ClubFilter.svelte';

  export let data: { article: Article, relatedArticles: any[], initialClub?: string };

  // Add club filter state
  let selectedClub = data.initialClub || 'All Clubs';
  const aleagueClubs = [
    'All Clubs',
    'Perth Glory',
    'Melbourne Victory',
    'Sydney FC',
    'Western Sydney Wanderers',
    'Adelaide United',
    'Brisbane Roar',
    'Central Coast Mariners',
    'Macarthur FC',
    'Melbourne City',
    'Newcastle Jets',
    'Wellington Phoenix'
  ];

  // Update related articles with club data
  let relatedArticles = (data.relatedArticles || []).map(article => ({
    ...article,
    publishDate: new Date(article.publishDate),
    club: article.club || 'Perth Glory' // Default to Perth Glory if club is missing
  }));

  function getFormattedDate(date: Date | string): string {
    if (!date) return '';

    if (typeof date === 'string') {
      date = new Date(date);
    }
    return format(date, 'MMMM d, yyyy');
  }

  function getRelativeDate(date: Date | string): string {
    if (!date) return '';

    if (typeof date === 'string') {
      date = new Date(date);
    }
    return formatDistance(date, new Date(), { addSuffix: true });
  }
</script>

<SEO
  title={`${data.article.title} | Perth Glory News`}
  description={data.article.excerpt}
  type="article"
  article={data.article}
  image={data.article.featuredImage}
  publishedTime={data.article.publishDate?.toISOString()}
  modifiedTime={(data.article.lastModified || data.article.scrapedAt)?.toISOString()}
  keywords={`Perth Glory, ${data.article.tags?.join(', ') || 'Football, A-League'}`}
/>

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
            {getFormattedDate(data.article.publishDate)}
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
          Last updated: {getFormattedDate(data.article.lastModified || data.article.scrapedAt)}
        </p>
      </footer>
    </div>
  </article>

  <!-- Tags -->
  <div class="mt-8">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
    <div class="flex flex-wrap gap-2">
      {#each data.article.tags as tag}
        <a
          href={`/tags/${tag}`}
          class="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          #{tag}
        </a>
      {/each}
    </div>
  </div>

  <!-- Add club filter below article content -->
  <div class="mt-8">
    <ClubFilter
      clubs={aleagueClubs}
      selected={selectedClub}
      on:select={(e) => {
        selectedClub = e.detail;
        window.history.replaceState({}, '', `?club=${encodeURIComponent(e.detail)}`);
      }}
    />
  </div>

  <!-- Update related articles section -->
  <div class="mt-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      {selectedClub === 'All Clubs' ? 'A-League' : selectedClub} News
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each relatedArticles.filter(a =>
        selectedClub === 'All Clubs' || a.club === selectedClub
      ) as related}
        <a href={`/article/${related.slug}`} class="group relative">
          <!-- Club badge -->
          <div class="absolute top-2 right-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm
            bg-{related.club.toLowerCase().replace(/ /g, '-')}-50
            dark:bg-{related.club.toLowerCase().replace(/ /g, '-')}-900/20">
            <span class="w-2 h-2 rounded-full mr-2
              bg-{related.club.toLowerCase().replace(/ /g, '-')}-500"></span>
            {related.club}
          </div>

          <!-- Existing article card content -->
          <div class="news-card h-full flex flex-col">
            <div class="aspect-video news-card-image overflow-hidden rounded-t-lg">
              <img
                src={related.featuredImage}
                alt={related.title}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="p-4 flex-grow flex flex-col">
              <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {related.title}
              </h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">{related.excerpt}</p>
              <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {getFormattedDate(related.publishDate)}
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>

  <!-- Comment Section -->
  <CommentSection articleId={data.article.id} articleTitle={data.article.title} />
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }
</style>