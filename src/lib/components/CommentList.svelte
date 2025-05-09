<script lang="ts">
  import { format } from 'date-fns';
  import type { Comment } from '../../types/comment';

  export let comments: Comment[] = [];
  export let articleId: string;

  function formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      // Less than 1 day ago
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        // Less than 1 hour ago
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes < 1 ? 'Just now' : `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }

    if (diffDays < 7) {
      // Less than a week ago
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    // More than a week ago, show actual date
    return format(date, 'MMM d, yyyy');
  }
</script>

<div class="space-y-6 my-8">
  {#if comments.length > 0}
    <div class="flex items-center mb-6">
      <div class="w-6 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full mr-3"></div>
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
    </div>
    <div class="space-y-6">
      {#each comments as comment (comment.id)}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 transition-all duration-200 hover:shadow-lg border-l-4 border-purple-500">
          <!-- Main comment -->
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg uppercase shadow-sm">
                {comment.authorName.charAt(0)}
              </div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center space-x-2">
                <h3 class="font-medium text-gray-900 dark:text-white">{comment.authorName}</h3>
                <span class="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <div class="mt-2 text-gray-700 dark:text-gray-300">
                <p>{comment.text}</p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="bg-purple-50 dark:bg-purple-900/10 rounded-lg shadow-md p-6 text-center border border-purple-100 dark:border-purple-800">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-purple-700 dark:text-purple-300 font-medium">Be the first to comment on this article!</p>
      <p class="text-purple-600/70 dark:text-purple-400/70 text-sm mt-2">Share your thoughts and join the discussion.</p>
    </div>
  {/if}
</div>