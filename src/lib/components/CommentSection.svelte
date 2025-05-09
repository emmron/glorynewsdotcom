<script lang="ts">
  import { onMount } from 'svelte';
  import { formatDistance } from 'date-fns';

  export let articleId: string;
  export let articleTitle: string;

  let comments = [];
  let newComment = { name: '', email: '', content: '' };
  let isLoading = true;
  let isSubmitting = false;
  let error = '';
  let success = '';

  onMount(async () => {
    try {
      isLoading = true;
      // In a real app, fetch comments from API
      // const response = await fetch(`/api/comments/${articleId}`);
      // comments = await response.json();

      // For demo, use mock data
      setTimeout(() => {
        comments = [
          {
            id: '1',
            name: 'Football Fan',
            content: 'Great article! I hope Perth Glory can turn things around soon.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
          },
          {
            id: '2',
            name: 'Glory Supporter',
            content: 'Been following Glory since day one, through thick and thin!',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
          }
        ];
        isLoading = false;
      }, 500);
    } catch (err) {
      error = 'Failed to load comments';
      isLoading = false;
    }
  });

  async function submitComment() {
    if (!newComment.name || !newComment.content) {
      error = 'Please fill in required fields';
      return;
    }

    try {
      isSubmitting = true;
      error = '';

      // In a real app, post to API
      // const response = await fetch(`/api/comments/${articleId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newComment)
      // });
      // if (!response.ok) throw new Error('Failed to post comment');
      // const newCommentData = await response.json();

      // For demo, simulate API response
      await new Promise(resolve => setTimeout(resolve, 500));

      const newCommentData = {
        id: `temp-${Date.now()}`,
        name: newComment.name,
        content: newComment.content,
        createdAt: new Date()
      };

      comments = [newCommentData, ...comments];
      newComment = { name: '', email: '', content: '' };
      success = 'Comment added successfully!';

      setTimeout(() => {
        success = '';
      }, 3000);
    } catch (err) {
      error = err.message || 'Failed to post comment';
    } finally {
      isSubmitting = false;
    }
  }

  function formatRelativeTime(date) {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  }
</script>

<section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-10" id="comments">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>

  <!-- Comment Form -->
  <div class="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Leave a comment</h3>

    {#if error}
      <div class="p-3 mb-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 rounded-lg">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="p-3 mb-4 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 rounded-lg">
        {success}
      </div>
    {/if}

    <form on:submit|preventDefault={submitComment} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            bind:value={newComment.name}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email (not published)
          </label>
          <input
            type="email"
            id="email"
            bind:value={newComment.email}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Comment <span class="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          bind:value={newComment.content}
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Share your thoughts..."
          required
        ></textarea>
      </div>

      <div>
        <button
          type="submit"
          class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          {:else}
            Post Comment
          {/if}
        </button>
      </div>
    </form>
  </div>

  <!-- Comments List -->
  {#if isLoading}
    <div class="flex justify-center py-8">
      <svg class="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else if comments.length === 0}
    <div class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p class="text-gray-600 dark:text-gray-300">No comments yet. Be the first to comment!</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each comments as comment (comment.id)}
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 first:border-0 first:pt-0">
          <div class="flex">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span class="font-medium text-purple-700 dark:text-purple-300">
                  {comment.name ? comment.name[0].toUpperCase() : '?'}
                </span>
              </div>
            </div>
            <div class="ml-4 flex-grow">
              <div class="flex justify-between items-center">
                <h4 class="text-md font-medium text-gray-900 dark:text-white">{comment.name}</h4>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <div class="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {comment.content}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>