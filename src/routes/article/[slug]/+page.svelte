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

<div class="bg-gray-50">
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <article class="bg-white rounded-xl shadow-lg overflow-hidden">
      {#if data.article.featuredImage}
        <div class="relative">
          <!-- Article hero image -->
          <div class="relative h-[500px] overflow-hidden">
            <img
              src={data.article.featuredImage}
              alt={data.article.title}
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>

          <!-- Source badge -->
          <div class="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md">
            {data.article.sourceName}
          </div>

          <!-- Title overlay -->
          <div class="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white z-10">
            <h1 class="text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              {data.article.title}
            </h1>
            <div class="flex items-center text-gray-200 text-sm">
              <div class="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time datetime={data.article.publishDate.toISOString()}>
                  {getFormattedDate(data.article.publishDate)}
                </time>
              </div>
              {#if data.article.readTime}
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{data.article.readTime} min read</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <div class="bg-purple-900 p-8">
          <h1 class="text-3xl md:text-5xl font-bold mb-4 text-white">
            {data.article.title}
          </h1>
          <div class="flex items-center text-purple-200 text-sm">
            <div class="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time datetime={data.article.publishDate.toISOString()}>
                {getFormattedDate(data.article.publishDate)}
              </time>
            </div>
            <div class="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>{data.article.sourceName}</span>
            </div>
            {#if data.article.readTime}
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{data.article.readTime} min read</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <div class="p-6 md:p-10">
        <!-- Article navigation -->
        <div class="hidden md:block sticky top-4 z-10">
          <div class="flex justify-end mb-4">
            <div class="inline-flex items-center space-x-2 bg-white rounded-lg shadow-md px-3 py-2 border border-gray-100">
              <button class="text-gray-500 hover:text-purple-600 transition-colors" title="Decrease font size">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="text-gray-500 hover:text-purple-600 transition-colors" title="Increase font size">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <div class="h-4 border-r border-gray-300"></div>
              <button class="text-gray-500 hover:text-purple-600 transition-colors" title="Share article">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
              <button class="text-gray-500 hover:text-purple-600 transition-colors" title="Print article">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Article content -->
        <div class="mt-6 article-content">
          {#if data.article.excerpt}
            <div class="text-xl text-gray-700 mb-6 font-medium italic border-l-4 border-purple-500 pl-4 py-2">
              {data.article.excerpt}
            </div>
          {/if}

          <div class="prose prose-lg max-w-none prose-headings:text-purple-900 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md mb-8">
            {data.article.content}
          </div>
        </div>

        <!-- Tags -->
        {#if data.article.tags && data.article.tags.length > 0}
          <div class="mt-8 pt-6 border-t border-gray-100">
            <h3 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Related Topics</h3>
            <div class="flex flex-wrap gap-2">
              {#each data.article.tags as tag}
                <a
                  href={`/tags/${tag}`}
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
                >
                  #{tag}
                </a>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Article footer -->
        <footer class="mt-8 pt-6 border-t border-gray-100">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div class="text-sm text-gray-600">
              <p class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Source: <a href={data.article.sourceUrl} class="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {data.article.sourceName}
                </a>
              </p>
              <p class="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {getFormattedDate(data.article.lastModified || data.article.scrapedAt)} ({getRelativeDate(data.article.lastModified || data.article.scrapedAt)})
              </p>
            </div>

            <!-- Share buttons for mobile -->
            <div class="md:hidden flex space-x-3">
              <button class="text-gray-500 hover:text-purple-600 transition-colors p-2 border border-gray-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button class="text-gray-500 hover:text-purple-600 transition-colors p-2 border border-gray-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </button>
              <button class="text-gray-500 hover:text-purple-600 transition-colors p-2 border border-gray-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </article>

    <!-- Author bio -->
    <div class="mt-8 bg-purple-50 rounded-xl p-6 shadow-sm">
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-purple-600 bg-white p-2 rounded-full shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h3 class="font-medium text-purple-900">About Perth Glory News</h3>
          <p class="text-sm text-gray-600 mt-1">
            Perth Glory News brings you the latest news, match reports, and player updates about Perth Glory FC. We aim to be your premier source for Glory content.
          </p>
          <div class="mt-3">
            <a href="/about" class="text-sm text-purple-600 hover:underline flex items-center justify-center md:justify-start">
              Learn more about us
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Club filter with improved design -->
    <div class="mt-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-3 md:mb-0">More Football News</h2>
        <ClubFilter
          clubs={aleagueClubs}
          selected={selectedClub}
          on:select={(e) => {
            selectedClub = e.detail;
            window.history.replaceState({}, '', `?club=${encodeURIComponent(e.detail)}`);
          }}
        />
      </div>
    </div>

    <!-- Related articles with improved design -->
    <div class="mt-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each relatedArticles.filter(a =>
          selectedClub === 'All Clubs' || a.club === selectedClub
        ) as related}
          <a href={`/article/${related.slug}`} class="group">
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div class="relative aspect-video overflow-hidden">
                <img
                  src={related.featuredImage}
                  alt={related.title}
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <!-- Club badge -->
                <div class="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center">
                  <span class="w-2 h-2 rounded-full mr-2 bg-purple-500"></span>
                  {related.club}
                </div>
              </div>
              <div class="p-4 flex-grow flex flex-col">
                <h3 class="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p class="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">{related.excerpt}</p>
                <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span class="text-xs text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {getFormattedDate(related.publishDate)}
                  </span>
                  <span class="text-purple-600 text-sm font-medium">Read More</span>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <!-- Comment Section with improved styling -->
    <div class="mt-12 bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Join The Conversation
      </h2>
      <CommentSection articleId={data.article.id} articleTitle={data.article.title} />
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Enhanced article typography */
  .article-content :global(h2) {
    @apply text-2xl font-bold text-purple-900 mt-8 mb-4;
  }

  .article-content :global(h3) {
    @apply text-xl font-bold text-purple-800 mt-6 mb-3;
  }

  .article-content :global(p) {
    @apply my-4 leading-relaxed;
  }

  .article-content :global(a) {
    @apply text-purple-600;
  }
  .article-content :global(a:hover) {
    @apply underline;
  }

  .article-content :global(ul),
  .article-content :global(ol) {
    @apply my-4 pl-6;
  }

  .article-content :global(li) {
    @apply mb-2;
  }

  .article-content :global(blockquote) {
    @apply border-l-4 border-purple-500 pl-4 py-2 my-6 italic text-gray-700;
  }

  .article-content :global(img) {
    @apply rounded-lg shadow-md my-6 mx-auto;
  }
</style>