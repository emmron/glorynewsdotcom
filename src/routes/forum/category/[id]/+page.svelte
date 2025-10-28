<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  // Extract data from the loaded data
  $: category = data.category;
  $: threads = data.threads;
  $: isLoggedIn = Boolean(data.user);

  // Sorting options
  let sortBy = 'recent';
  $: sortedThreads = sortThreads(threads, sortBy);

  function sortThreads(threads, sortOption) {
    // Always show pinned threads at the top
    const pinnedThreads = threads.filter(t => t.isPinned);
    const unpinnedThreads = threads.filter(t => !t.isPinned);

    // Sort unpinned threads based on the selected sort option
    let sorted;
    switch (sortOption) {
      case 'recent':
        sorted = [...unpinnedThreads].sort((a, b) => new Date(b.lastPostDate).getTime() - new Date(a.lastPostDate).getTime());
        break;
      case 'views':
        sorted = [...unpinnedThreads].sort((a, b) => b.views - a.views);
        break;
      case 'replies':
        sorted = [...unpinnedThreads].sort((a, b) => b.replies - a.replies);
        break;
      case 'oldest':
        sorted = [...unpinnedThreads].sort((a, b) => new Date(a.lastPostDate).getTime() - new Date(b.lastPostDate).getTime());
        break;
      default:
        sorted = unpinnedThreads;
    }

    // Combine pinned and sorted unpinned threads
    return [...pinnedThreads, ...sorted];
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

</script>

<SEO
  title={category ? `${category.name} | Forum | Perth Glory News` : 'Forum | Perth Glory News'}
  description={category ? `Discuss ${category.description} in the Perth Glory News forum` : 'Join the Perth Glory News forum discussions'}
  keywords={`Perth Glory, forum, discussion, ${category?.name || 'football'}, A-League`}
/>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  {#if !category}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p>Sorry, we couldn't find the category you're looking for.</p>
      <p class="mt-2">
        <a href="/forum" class="text-purple-600 hover:underline">Return to the forum</a>
      </p>
    </div>
  {:else}
    <!-- Category Header -->
    <div class="mb-6">
      <div class="flex items-center text-sm mb-2">
        <a href="/forum" class="text-purple-600 hover:underline">Forum</a>
        <span class="mx-2">›</span>
        <span class="text-gray-600">{category.name}</span>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-purple-800 mb-2">{category.name}</h1>
          <p class="text-gray-600">{category.description}</p>
        </div>

        <div class="flex items-center space-x-3">
          <a href="/forum" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">Back to Forum</a>
          {#if isLoggedIn}
            <a href={`/forum/new-topic?category=${category.id}`} class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">New Topic</a>
          {:else}
            <button class="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm cursor-not-allowed" title="Please log in to create a new topic">
              New Topic
            </button>
          {/if}
        </div>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center mb-2 md:mb-0">
            <div class="bg-purple-100 rounded-full p-3 mr-4">
              <span class="text-purple-700 text-lg">
                {category.icon === 'message-circle' ? '💬' : ''}
                {category.icon === 'calendar' ? '📅' : ''}
                {category.icon === 'refresh-cw' ? '🔄' : ''}
                {category.icon === 'layout' ? '📊' : ''}
                {category.icon === 'users' ? '👥' : ''}
                {category.icon === 'award' ? '🏆' : ''}
              </span>
            </div>
            <div>
              <div class="text-sm text-gray-600">Statistics</div>
              <div>
                <span class="font-medium">{category.threadCount}</span> threads,
                <span class="font-medium">{category.postCount}</span> posts
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <label for="sort-by" class="text-sm text-gray-600 mr-2">Sort by:</label>
            <select
              id="sort-by"
              bind:value={sortBy}
              class="bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="recent">Most Recent</option>
              <option value="views">Most Views</option>
              <option value="replies">Most Replies</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Thread List -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div class="bg-purple-50 p-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-purple-800">Threads</h2>
      </div>

      {#if sortedThreads.length === 0}
        <div class="p-6 text-center">
          <p class="text-gray-600">No threads found in this category.</p>
          <a href="/forum/new-topic?category={category.id}" class="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Start the First Discussion</a>
        </div>
      {:else}
        <div class="divide-y divide-gray-200">
          {#each sortedThreads as thread}
            <div class="p-4 hover:bg-gray-50">
              <div class="flex items-start">
                <div class="flex-grow">
                  <div class="flex items-center">
                    {#if thread.isPinned}
                      <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded mr-2">PINNED</span>
                    {/if}
                    {#if thread.isLocked}
                      <span class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded mr-2">LOCKED</span>
                    {/if}
                    <a href={`/forum/thread/${thread.id}`} class="font-bold text-purple-700 hover:text-purple-900 transition-colors">{thread.title}</a>
                  </div>
                  <div class="flex items-center mt-2 text-xs text-gray-500">
                    <span>by <a href={`/forum/user/${thread.author}`} class="text-purple-600 hover:underline">{thread.author}</a></span>
                  </div>
                </div>
                <div class="text-right text-sm">
                  <div class="flex items-center text-gray-500 justify-end">
                    <span class="mr-4">{thread.replies} replies</span>
                    <span>{thread.views} views</span>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <span>Last post by <a href={`/forum/user/${thread.lastPostAuthor}`} class="text-purple-600 hover:underline">{thread.lastPostAuthor}</a></span>
                    <span class="block">{formatTimeAgo(thread.lastPostDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Pagination -->
    {#if sortedThreads.length > 10}
      <div class="flex justify-center mb-6">
        <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="#" aria-current="page" class="relative inline-flex items-center px-4 py-2 border border-purple-500 bg-purple-50 text-sm font-medium text-purple-600">1</a>
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">8</a>
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">9</a>
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">10</a>
          <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </a>
        </nav>
      </div>
    {/if}

    <!-- Forum Rules -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="bg-purple-50 p-4 border-b border-gray-200">
        <h3 class="font-bold text-purple-800">Forum Rules</h3>
      </div>
      <div class="p-4 text-sm text-gray-600">
        <p class="mb-2">Please follow these guidelines when posting in the {category.name} category:</p>
        <ul class="list-disc ml-5 space-y-1">
          <li>Be respectful to other forum members</li>
          <li>Stay on topic and post in the appropriate category</li>
          <li>No spam, advertising, or self-promotion</li>
          <li>No offensive language or personal attacks</li>
          <li>No posting of illegal content or links</li>
        </ul>
        <p class="mt-2">Failure to follow these rules may result in your post being removed or your account being suspended.</p>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }
</style>
