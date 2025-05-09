<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { CommentFormData } from '../../types/comment';

  export let articleId: string;
  export let submitting: boolean = false;
  export let error: string | null = null;

  const dispatch = createEventDispatcher<{
    submit: { formData: CommentFormData };
    cancel: void;
  }>();

  let formData: CommentFormData = {
    author: '',
    content: ''
  };

  // Check if formData is stored in localStorage
  let savedFormDataStr: string | null = null;

  function loadSavedData() {
    if (typeof window !== 'undefined') {
      savedFormDataStr = localStorage.getItem('commentFormData');
      if (savedFormDataStr) {
        try {
          const savedData = JSON.parse(savedFormDataStr);
          formData = {
            ...formData,
            author: savedData.author || ''
          };
        } catch (e) {
          console.error('Failed to parse saved form data', e);
        }
      }
    }
  }

  onMount(() => {
    loadSavedData();
  });

  function saveFormData() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('commentFormData', JSON.stringify({
        author: formData.author
      }));
    }
  }

  function submitForm() {
    // Basic validation
    if (!formData.author.trim() || !formData.content.trim()) {
      error = 'Please fill out all fields';
      return;
    }

    // Save author for future comments
    saveFormData();

    // Submit form
    dispatch('submit', { formData });
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-4 border border-purple-100 dark:border-purple-800/30">
  <form on:submit|preventDefault={submitForm} class="space-y-5">
    <div>
      <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          Your Name*
        </span>
      </label>
      <input
        type="text"
        id="author"
        bind:value={formData.author}
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
        placeholder="Your name"
        required
      />
    </div>

    <div>
      <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
          </svg>
          Your Comment*
        </span>
      </label>
      <textarea
        id="content"
        bind:value={formData.content}
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
        placeholder="Share your thoughts about this article..."
        required
      ></textarea>
    </div>

    {#if error}
      <div class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-md text-sm">
        <div class="flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    {/if}

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-1"
        disabled={submitting}
      >
        {#if submitting}
          <div class="inline-flex items-center">
            <div class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Submitting...</span>
          </div>
        {:else}
          <div class="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span>Post Comment</span>
          </div>
        {/if}
      </button>
    </div>

    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      Your comments help make our community better. Be respectful and thoughtful.
    </p>
  </form>
</div>