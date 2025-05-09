<script lang="ts">
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import SEO from '$lib/components/SEO.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { addReply } from '$lib/services/forumService';
  import type { ForumReply } from '$lib/types/forum';
  import { goto } from '$app/navigation';

  export let data: PageData;

  // Extract thread and replies from the loaded data
  $: thread = data.thread;
  $: replies = data.replies;
  $: loading = !thread;
  $: error = !thread ? 'Thread not found' : '';

  // User state (simplified - would use auth service in production)
  let isLoggedIn = false;
  let username = '';
  let replyContent = '';
  let submitting = false;
  let postSuccess = false;

  function handleLogin() {
    if (username.trim()) {
      isLoggedIn = true;
      localStorage.setItem('forum_user', username);
    }
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

  function formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Function to safely get category name
  function getCategoryName(category: any): string {
    if (!category) return 'Unknown Category';

    if (typeof category === 'string') return category;

    if (typeof category === 'object' && category !== null) {
      if ('name' in category) return category.name;
      if ('id' in category) return category.id;
    }

    return 'Unknown Category';
  }

  // Function to safely get category ID
  function getCategoryId(category: any): string {
    if (!category) return '';

    if (typeof category === 'string') return category;

    if (typeof category === 'object' && category !== null) {
      if ('id' in category) return category.id;
    }

    return '';
  }

  async function handleReply() {
    // In a real app, this would send the reply to the server
    if (replyContent.trim() && thread) {
      submitting = true;
      postSuccess = false;

      try {
        const newReply: Omit<ForumReply, 'id'> = {
          threadId: thread.id,
          author: username,
          authorAvatar: null,
          createdAt: new Date(),
          content: replyContent,
          likes: 0,
          isEdited: false
        };

        // Add the reply to storage
        const addedReply = addReply(newReply);

        // Update local state with the new reply
        replies = [...replies, addedReply];

        replyContent = '';
        postSuccess = true;

        // Scroll to the newly added reply
        setTimeout(() => {
          const newReplyElement = document.getElementById(`reply-${addedReply.id}`);
          if (newReplyElement) {
            newReplyElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);

        // Refresh the page after a brief delay to show updated data
        setTimeout(() => {
          postSuccess = false;
        }, 3000);
      } catch (e) {
        alert('There was an error posting your reply. Please try again.');
      } finally {
        submitting = false;
      }
    }
  }

  function refreshPage() {
    goto(`/forum/thread/${$page.params.id}`, { invalidateAll: true });
  }

  onMount(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('forum_user');
    if (savedUser) {
      isLoggedIn = true;
      username = savedUser;
    }
  });
</script>

<SEO
  title={thread ? `${thread.title} | Forum | Perth Glory News` : 'Thread Not Found | Forum | Perth Glory News'}
  description={thread ? `Join the discussion about ${thread.title} in the Perth Glory News forum` : 'This forum thread could not be found'}
  keywords={thread ? `Perth Glory, forum, discussion, ${getCategoryName(thread.category)}, ${thread.title}` : 'Perth Glory, forum, error'}
/>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  {#if !thread || error}
    <div in:fade class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-sm text-center">
      <svg class="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-2xl font-bold mb-2">Thread Not Found</h2>
      <p class="mb-4">Sorry, the thread you're looking for doesn't exist or has been removed.</p>
      <a href="/forum" class="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
        Return to Forum
      </a>
    </div>
  {:else}
    <!-- Thread Title -->
    <div class="mb-6" in:fly={{ y: -20, duration: 300 }}>
      <div class="flex items-center text-sm mb-2 flex-wrap">
        <a href="/forum" class="text-purple-600 hover:underline">Forum</a>
        <span class="mx-2">›</span>
        <a href={`/forum/category/${getCategoryId(thread.category)}`} class="text-purple-600 hover:underline">
          {getCategoryName(thread.category)}
        </a>
        <span class="mx-2">›</span>
        <span class="text-gray-600">Thread</span>
      </div>

      <div class="flex justify-between items-start flex-wrap gap-3">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          {#if thread.isPinned}
            <span class="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">PINNED</span>
          {/if}
          {#if thread.isLocked}
            <span class="text-sm bg-red-100 text-red-800 px-2 py-1 rounded mr-2">LOCKED</span>
          {/if}
          {thread.title}
        </h1>

        <div class="flex space-x-2">
          <a href="/forum" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">Back to Forum</a>
          {#if isLoggedIn && !thread.isLocked}
            <button class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm" on:click={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Reply</button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Original Post -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6" in:fly={{ y: 20, duration: 300, delay: 100 }}>
      <div class="bg-purple-50 p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <div>
          <span class="font-bold">{thread.author}</span>
          <span class="text-gray-600 text-sm ml-2" title={formatDate(thread.createdAt)}>{formatTimeAgo(thread.createdAt)}</span>
        </div>
        <div class="text-sm text-gray-600">
          Views: {thread.views}
        </div>
      </div>

      <div class="p-6">
        <div class="prose prose-purple max-w-none">
          <!-- Using @html is fine for this simplified example, but would need proper sanitization in production -->
          {@html thread.content}
        </div>
      </div>

      <div class="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center text-sm">
        <div>
          <a href={`/forum/user/${thread.author}`} class="text-purple-600 hover:underline">View Profile</a>
        </div>
        <div>
          <button class="text-gray-600 hover:text-gray-900 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v7.086a2 2 0 01-.586 1.414L17 19.5H7a2 2 0 01-2-2z" />
            </svg>
            Report
          </button>
        </div>
      </div>
    </div>

    <!-- Success notification -->
    {#if postSuccess}
      <div class="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50"
           in:fly={{ y: 50, duration: 300 }} out:fade={{ duration: 300 }}>
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Reply posted successfully!</span>
        </div>
      </div>
    {/if}

    <!-- Replies -->
    <div class="mb-6" in:fade={{ duration: 300, delay: 200 }}>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Replies ({replies.length})</h2>
        <button
          class="text-purple-600 hover:text-purple-800 flex items-center text-sm"
          on:click={refreshPage}
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {#each replies as reply, index}
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-4" id={`reply-${reply.id}`}>
          <div class="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                {#if reply.authorAvatar}
                  <img src={reply.authorAvatar} alt={reply.author} class="w-8 h-8 rounded-full" />
                {:else}
                  <span class="text-purple-700 font-bold">{reply.author.charAt(0).toUpperCase()}</span>
                {/if}
              </div>
              <div>
                <a href={`/forum/user/${reply.author}`} class="font-bold hover:underline">{reply.author}</a>
                <span class="text-gray-600 text-sm ml-2" title={formatDate(reply.createdAt)}>{formatTimeAgo(reply.createdAt)}</span>
                {#if reply.isEdited}
                  <span class="text-gray-500 text-xs italic ml-2">(edited)</span>
                {/if}
              </div>
            </div>
            <div class="text-sm text-gray-600">
              #{index + 1}
            </div>
          </div>

          <div class="p-6">
            <div class="prose prose-purple max-w-none">
              <!-- Using @html is fine for this simplified example, but would need proper sanitization in production -->
              {@html reply.content}
            </div>
          </div>

          <div class="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center text-sm">
            <div class="flex items-center">
              <button class="flex items-center text-gray-600 hover:text-purple-600 mr-4">
                <span class="mr-1">👍</span>
                Like ({reply.likes})
              </button>
              {#if isLoggedIn && !thread.isLocked}
                <button class="flex items-center text-gray-600 hover:text-purple-600">
                  <span class="mr-1">💬</span>
                  Quote
                </button>
              {/if}
            </div>
            <div>
              <button class="text-gray-600 hover:text-gray-900 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v7.086a2 2 0 01-.586 1.414L17 19.5H7a2 2 0 01-2-2z" />
                </svg>
                Report
              </button>
            </div>
          </div>
        </div>
      {/each}

      {#if replies.length === 0}
        <div class="bg-gray-50 text-gray-600 p-6 rounded-lg text-center">
          <p>No replies yet. Be the first to reply!</p>
        </div>
      {/if}
    </div>

    <!-- Reply Form -->
    {#if !thread.isLocked}
      <div class="bg-white rounded-lg shadow-md overflow-hidden" id="reply-form" in:fly={{ y: 50, duration: 300, delay: 300 }}>
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h3 class="font-bold text-purple-800">Post a Reply</h3>
        </div>

        <div class="p-6">
          {#if isLoggedIn}
            <form on:submit|preventDefault={handleReply} class="space-y-4">
              <div>
                <label for="reply-content" class="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                <textarea
                  id="reply-content"
                  bind:value={replyContent}
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="What are your thoughts?"
                  required
                  disabled={submitting}
                ></textarea>
                <p class="mt-1 text-xs text-gray-500">
                  <b>Note:</b> This is a demo forum with sample data. Replies are temporarily stored in your browser and may not persist after refreshing or closing the browser.
                </p>
              </div>
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  <span>Posting as <strong>{username}</strong></span>
                </div>
                <button
                  type="submit"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium flex items-center"
                  disabled={submitting}
                >
                  {#if submitting}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  {:else}
                    Post Reply
                  {/if}
                </button>
              </div>
            </form>
          {:else}
            <div class="bg-gray-50 p-4 rounded-md text-center">
              <p class="text-gray-700 mb-3">You need to be logged in to reply to this thread.</p>
              <div class="flex flex-col sm:flex-row justify-center gap-3">
                <input
                  type="text"
                  placeholder="Your username"
                  bind:value={username}
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  on:click={handleLogin}
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                >
                  Quick Login
                </button>
                <div class="text-sm text-gray-600 flex items-center justify-center mt-2 sm:mt-0">
                  <span class="italic">(Demo purposes only)</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center" in:fade={{ duration: 300 }}>
        <p class="text-red-700">This thread is locked. No new replies can be added.</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }

  /* Responsive prose styles */
  :global(.prose) {
    font-size: 1rem;
    line-height: 1.6;
  }

  :global(.prose p) {
    margin-bottom: 1rem;
  }

  :global(.prose blockquote) {
    border-left: 3px solid #9333ea;
    padding-left: 1rem;
    color: #6b7280;
    font-style: italic;
    margin: 1.5rem 0;
  }

  :global(.prose a) {
    color: #9333ea;
    text-decoration: none;
  }

  :global(.prose a:hover) {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    :global(.prose) {
      font-size: 0.9375rem;
    }
  }
</style>