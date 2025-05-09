<script lang="ts">
  import { onMount } from 'svelte';
  import type { Comment, CommentFormData } from '../../types/comment';
  import CommentForm from './CommentForm.svelte';
  import CommentList from './CommentList.svelte';

  export let articleId: string;
  export let articleTitle: string;

  let comments: Comment[] = [];
  let loading = true;
  let error: string | null = null;
  let submitting = false;
  let formError: string | null = null;
  let commentsCount = 0;

  onMount(async () => {
    await loadComments();
  });

  async function loadComments() {
    loading = true;
    error = null;

    try {
      // Fetch comments from our API endpoint
      const response = await fetch(`/api/comments/${articleId}`);

      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.statusText}`);
      }

      comments = await response.json();
      commentsCount = comments.length;
    } catch (err) {
      console.error('Error loading comments:', err);
      error = 'Failed to load comments. Please reload the page.';
    } finally {
      loading = false;
    }
  }

  async function handleSubmitComment(event: CustomEvent) {
    const { formData } = event.detail;
    submitting = true;
    formError = null;

    try {
      // Post to our API endpoint
      const response = await fetch(`/api/comments/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorName: formData.author,
          text: formData.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Reset form and reload comments
      formData.content = '';

      // Show success notification
      alert('Your comment has been submitted successfully');

      // Reload comments to show the new comment
      await loadComments();

    } catch (err) {
      console.error('Error submitting comment:', err);
      formError = err instanceof Error ? err.message : 'Failed to submit comment. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<section id="comments" class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center">
      <div class="mr-3 flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
        <span class="gradient-text">Join the Conversation</span>
        {#if commentsCount > 0}
          <span class="ml-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 px-2 py-1 rounded-full">{commentsCount}</span>
        {/if}
      </h2>
    </div>
    {#if commentsCount > 0}
      <button
        on:click={loadComments}
        class="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
        Refresh
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="flex justify-center py-10">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  {:else if error}
    <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300 mb-8">
      <p>{error}</p>
      <button
        class="mt-2 text-sm font-medium underline"
        on:click={loadComments}
      >
        Try again
      </button>
    </div>
  {:else}
    <CommentList {comments} {articleId} />

    <div class="mt-10">
      <div class="flex items-center mb-4">
        <div class="w-8 h-1 bg-purple-600 rounded-full mr-3"></div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          Share Your Thoughts
        </h3>
      </div>
      <CommentForm
        {articleId}
        submitting={submitting}
        error={formError}
        on:submit={handleSubmitComment}
      />
    </div>
  {/if}
</section>

<style>
  .loader {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .loader div {
    width: 0.75rem;
    height: 0.75rem;
    background-color: #8b5cf6;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loader div:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loader div:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
</style>