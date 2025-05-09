<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import type { Comment } from '../../../types/comment';

  // Get data from the load function
  export let data;

  // Extract article and error from data
  $: article = data.article;
  $: error = data.error || '';
  $: success = data.success;
  $: comments = data.comments || [];

  // Comment form state
  let newComment = { authorName: '', text: '' };
  let isSubmitting = false;
  let commentError = '';
  let commentSuccess = '';

  // For reading progress
  let scrollY = 0;
  let innerHeight = 0;
  let documentHeight = 0;
  let readingProgress = 0;

  // PWA online/offline status
  let isOnline = true;
  let wasOffline = false;
  let showOfflineNotice = false;

  // For estimated reading time
  $: estimatedReadTime = article ? Math.max(1, Math.ceil(article.content?.split(/\s+/).length / 200)) : 0;

  // For related articles - would come from server in real app
  let relatedArticles = [
    {
      id: 'glory-striker-signing',
      title: 'Perth Glory signs new striker ahead of upcoming season',
      summary: 'The club announced a major signing that could boost their attacking options.',
      imageUrl: '/images/news/striker-signing.jpg',
      date: new Date(Date.now() - 86400000 * 2) // 2 days ago
    },
    {
      id: 'melbourne-victory',
      title: 'Glory secure crucial away victory against Melbourne',
      summary: 'A standout performance from the midfield led to an important three points.',
      imageUrl: '/images/news/melbourne-match.jpg',
      date: new Date(Date.now() - 86400000 * 4) // 4 days ago
    },
    {
      id: 'preseason-training',
      title: 'Pre-season preparations underway with new coaching staff',
      summary: 'Players return to training under the guidance of the newly assembled coaching team.',
      imageUrl: '/images/news/preseason-training.jpg',
      date: new Date(Date.now() - 86400000 * 6) // 6 days ago
    }
  ];

  // For text-to-speech functionality
  let isSpeaking = false;
  let speechSynthesis: SpeechSynthesis;
  let speechUtterance: SpeechSynthesisUtterance;

  function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    img.src = '/images/default-news.jpg';
  }

  // Format date for display
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  // Format date for related articles
  function formatShortDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date for comments
  function formatCommentDate(date: string | Date): string {
    const commentDate = new Date(date);

    // Calculate time difference
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return commentDate.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  // Share article function
  function shareArticle() {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showToast('Article link copied to clipboard!');
        })
        .catch(err => console.error('Could not copy text: ', err));
    }
  }

  // Toast notification
  let toastMessage = '';
  let showToastNotification = false;

  function showToast(message: string) {
    toastMessage = message;
    showToastNotification = true;
    setTimeout(() => {
      showToastNotification = false;
    }, 3000);
  }

  // Text-to-speech functionality
  function toggleTextToSpeech() {
    if (!speechSynthesis) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      isSpeaking = false;
    } else {
      // Create a clean text version of the article content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content;
      const cleanText = tempDiv.textContent || '';

      speechUtterance = new SpeechSynthesisUtterance(article.title + '. ' + cleanText);
      speechUtterance.lang = 'en-AU';
      speechUtterance.rate = 0.9;

      speechUtterance.onend = () => {
        isSpeaking = false;
      };

      speechSynthesis.speak(speechUtterance);
      isSpeaking = true;
    }
  }

  // Update reading progress on scroll
  function updateReadingProgress() {
    documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    readingProgress = scrollY / (documentHeight - innerHeight);
  }

  // Scroll to top function
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Scroll to comments section
  function scrollToComments() {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Submit a new comment
  async function submitComment() {
    if (!newComment.authorName.trim() || !newComment.text.trim()) {
      commentError = 'Please fill in all fields';
      return;
    }

    commentError = '';
    isSubmitting = true;

    try {
      const response = await fetch(`/api/comments/${article.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const addedComment = await response.json();
      comments = [...comments, addedComment];
      newComment = { authorName: '', text: '' };
      commentSuccess = 'Comment added successfully!';

      // Clear success message after 3 seconds
      setTimeout(() => {
        commentSuccess = '';
      }, 3000);
    } catch (err) {
      commentError = err instanceof Error ? err.message : 'Failed to post comment';
    } finally {
      isSubmitting = false;
    }
  }

  // Font size adjustment
  let fontSizeLevel = 1; // 0: small, 1: medium, 2: large

  function decreaseFontSize() {
    if (fontSizeLevel > 0) {
      fontSizeLevel--;
      document.documentElement.style.setProperty('--article-font-size-multiplier', (0.9 + (fontSizeLevel * 0.1)).toString());
    }
  }

  function increaseFontSize() {
    if (fontSizeLevel < 2) {
      fontSizeLevel++;
      document.documentElement.style.setProperty('--article-font-size-multiplier', (0.9 + (fontSizeLevel * 0.1)).toString());
    }
  }

  // Handle online/offline events for PWA
  function handleOnlineStatusChange() {
    const wasOfflineBefore = !isOnline;
    isOnline = navigator.onLine;

    // If we just came back online and we were offline before
    if (isOnline && wasOfflineBefore) {
      showToast('You are back online!');
      wasOffline = true;
    }
    // If we just went offline
    else if (!isOnline) {
      showOfflineNotice = true;
      setTimeout(() => {
        showOfflineNotice = false;
      }, 5000);
    }
  }

  // Save article for offline reading
  async function saveForOfflineReading() {
    if (!('caches' in window)) {
      showToast('Offline storage not supported in your browser');
      return;
    }

    try {
      // Store article data in localStorage
      const articleData = {
        ...article,
        cachedAt: new Date().toISOString(),
      };

      localStorage.setItem(`article_${article.id}`, JSON.stringify(articleData));

      // Attempt to cache images
      if (article.imageUrl) {
        try {
          const cache = await caches.open('glory-news-images');
          await cache.add(article.imageUrl);
        } catch (error) {
          console.error('Failed to cache image:', error);
        }
      }

      showToast('Article saved for offline reading');
    } catch (error) {
      console.error('Failed to save for offline:', error);
      showToast('Failed to save article offline');
    }
  }

  onMount(() => {
    innerHeight = window.innerHeight;

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis = window.speechSynthesis;
    }

    // Set default font size
    document.documentElement.style.setProperty('--article-font-size-multiplier', '1');

    // Setup online/offline listeners
    isOnline = navigator.onLine;
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    const handleScroll = () => {
      scrollY = window.scrollY;
      updateReadingProgress();
    };

    const handleResize = () => {
      innerHeight = window.innerHeight;
      updateReadingProgress();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    updateReadingProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);

      // Clean up speech synthesis
      if (speechSynthesis && isSpeaking) {
        speechSynthesis.cancel();
      }
    };
  });
</script>

<svelte:head>
  {#if article}
    <title>{article.title} | Perth Glory News</title>
    <meta name="description" content={article.summary} />
    <meta property="og:title" content={article.title} />
    <meta property="og:description" content={article.summary} />
    {#if article.imageUrl}
      <meta property="og:image" content={article.imageUrl} />
    {/if}
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://perthglorynews.com/news/${article.id}`} />
  {:else}
    <title>Article | Perth Glory News</title>
  {/if}
</svelte:head>

<div class="article-page">
  <!-- Reading Progress Bar -->
  <div class="fixed top-0 left-0 w-full h-1.5 z-50 bg-gray-200">
    <div
      class="h-full bg-purple-600 transition-all duration-150 ease-out"
      style="width: {Math.floor(readingProgress * 100)}%"
    ></div>
  </div>

  <!-- Offline Notice Banner -->
  {#if showOfflineNotice}
    <div
      class="fixed top-20 left-0 w-full bg-yellow-500 text-white px-4 py-3 z-50 flex items-center justify-center"
      in:fly={{ y: -50, duration: 300 }}
      out:fly={{ y: -50, duration: 300 }}
    >
      <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      You're currently offline. Some features may be limited.
    </div>
  {/if}

  <!-- Toast Notification -->
  {#if showToastNotification}
    <div
      class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center"
      in:scale={{ duration: 200, start: 0.8 }}
      out:fade={{ duration: 200 }}
    >
      <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {toastMessage}
    </div>
  {/if}

  <main class="article-page__main container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    {#if !success && error}
      <div class="article-page__error text-center bg-red-50 text-red-600 py-8 rounded-lg shadow-sm" in:fly={{ y: 20, duration: 400 }}>
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-lg font-medium mb-2">{error}</p>
        <a
          href="/news"
          class="inline-block mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
        >
          Back to News
        </a>
      </div>
    {:else if article}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article class="lg:col-span-8 article-page__content bg-white rounded-2xl shadow-lg overflow-hidden" in:fly={{ y: 50, duration: 600 }}>
          {#if article.imageUrl}
            <div class="article-page__image-container relative aspect-video bg-purple-50">
              <img
                src={article.imageUrl}
                alt={article.title}
                class="w-full h-full object-cover"
                on:error={handleImageError}
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

              {#if article.category}
                <div class="absolute top-4 left-4 z-10">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-600 text-white shadow-md">
                    {article.category}
                  </span>
                </div>
              {/if}
            </div>
          {/if}

          <div class="p-5 sm:p-8">
            <header class="article-page__header mb-8">
              <div class="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-3">
                <a
                  href="/news"
                  class="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Back to News
                </a>
                <span class="text-gray-300">|</span>
                <time class="flex items-center" datetime={article.publishDate || article.date}>
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(article.publishDate || article.date)}
                </time>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {estimatedReadTime} min read
                </span>
              </div>

              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
                {article.title}
              </h1>

              {#if article.author}
                <div class="flex items-center mt-6">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-purple-700 font-bold">{article.author[0]}</span>
                  </div>
                  <div>
                    <div class="font-medium">By {article.author}</div>
                    <div class="text-sm text-gray-500">Perth Glory News Contributor</div>
                  </div>
                </div>
              {/if}
            </header>

            <div class="article-page__social-share flex gap-2 mb-8">
              <button
                class="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                on:click={shareArticle}
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              <!-- Save offline button for PWA -->
              <button
                class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                on:click={saveForOfflineReading}
                disabled={!isOnline}
                title={!isOnline ? "Can't save while offline" : "Save for offline reading"}
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Read Offline
              </button>
            </div>

            <div class="article-page__content prose prose-lg prose-purple max-w-none">
              {@html article.content}
            </div>

            {#if article.tags && article.tags.length > 0}
              <div class="mt-10 pt-6 border-t border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Topics</h2>
                <div class="flex flex-wrap gap-2">
                  {#each article.tags as tag}
                    <a href={`/news?tag=${tag}`} class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                      #{tag}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            {#if article.sourceUrl}
              <div class="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
                Source: <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">{article.source || 'Original Article'}</a>
              </div>
            {/if}

            <!-- Comments Section -->
            <div class="mt-12 pt-8 border-t border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

              <!-- Comment Form -->
              <div class="bg-gray-50 p-4 rounded-xl mb-8">
                <h3 class="text-lg font-semibold mb-4">Join the conversation</h3>

                {#if commentSuccess}
                  <div class="bg-green-50 text-green-700 p-3 rounded-lg mb-4" in:fade={{ duration: 300 }}>
                    {commentSuccess}
                  </div>
                {/if}

                {#if commentError}
                  <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4" in:fade={{ duration: 300 }}>
                    {commentError}
                  </div>
                {/if}

                <form on:submit|preventDefault={submitComment} class="space-y-4">
                  <div>
                    <label for="authorName" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="authorName"
                      bind:value={newComment.authorName}
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label for="commentText" class="block text-sm font-medium text-gray-700 mb-1">Your comment</label>
                    <textarea
                      id="commentText"
                      bind:value={newComment.text}
                      rows="4"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Share your thoughts..."
                      required
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                      disabled={isSubmitting || !isOnline}
                    >
                      {#if isSubmitting}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      {:else if !isOnline}
                        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Offline Mode
                      {:else}
                        Post Comment
                      {/if}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Comments List -->
              <div class="space-y-6">
                {#if comments.length === 0}
                  <div class="text-center py-8 bg-gray-50 rounded-lg">
                    <p class="text-gray-600">Be the first to leave a comment!</p>
                  </div>
                {:else}
                  {#each comments as comment}
                    <div class="bg-gray-50 p-4 rounded-lg" in:fade={{ duration: 300 }}>
                      <div class="flex items-start">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-purple-700 font-bold">{comment.authorName[0]}</span>
                        </div>
                        <div class="ml-3 flex-grow">
                          <div class="flex justify-between items-center mb-1">
                            <h4 class="font-medium text-gray-900">{comment.authorName}</h4>
                            <span class="text-sm text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                          </div>
                          <div class="text-gray-700 whitespace-pre-line break-words">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="lg:col-span-4 self-start" in:fly={{ y: 50, duration: 600, delay: 200 }}>
          <div class="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>

              <div class="space-y-6">
                {#each relatedArticles as related}
                  <div class="flex gap-3">
                    <div class="flex-shrink-0 w-20 h-20 bg-purple-100 rounded-lg overflow-hidden">
                      <img
                        src={related.imageUrl}
                        alt={related.title}
                        class="w-full h-full object-cover"
                        on:error={handleImageError}
                      />
                    </div>
                    <div class="flex-grow">
                      <h3 class="font-medium text-gray-900 line-clamp-2 text-sm">
                        <a href={`/news/${related.id}`} class="hover:text-purple-700 transition-colors">
                          {related.title}
                        </a>
                      </h3>
                      <p class="text-gray-500 text-xs mt-1">{formatShortDate(related.date)}</p>
                    </div>
                  </div>
                {/each}
              </div>

              <div class="mt-6 pt-4 border-t border-gray-100">
                <a
                  href="/news"
                  class="flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  View All News
                  <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Newsletter Signup -->
          <div class="bg-purple-700 text-white rounded-xl shadow-md overflow-hidden mt-6">
            <div class="p-6">
              <h2 class="text-xl font-bold mb-4">Glory Newsletter</h2>
              <p class="text-purple-100 mb-4">Get the latest Perth Glory news directly to your inbox.</p>

              <form class="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  class="w-full px-4 py-2 rounded-lg bg-purple-600 text-white placeholder-purple-300 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  class="w-full px-4 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  disabled={!isOnline}
                >
                  {isOnline ? 'Subscribe' : 'Offline Mode'}
                </button>
              </form>

              <p class="text-xs text-purple-200 mt-4">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
        </aside>
      </div>

      <!-- Back to top button -->
      {#if readingProgress > 0.3}
        <button
          class="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-30"
          on:click={scrollToTop}
          in:fade={{ duration: 200 }}
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      {/if}
    {:else}
      <div class="article-page__loader flex flex-col justify-center items-center h-64" in:fade={{ duration: 200 }}>
        <div class="article-page__spinner animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        <p class="mt-4 text-purple-600 font-medium">Loading article...</p>
      </div>
    {/if}
  </main>
</div>

<style>
  .article-page {
    background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
    min-height: 100vh;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .article-page__spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  :global(.prose) {
    max-width: none;
    font-size: 1.1rem;
    line-height: 1.8;
  }

  :global(.prose img) {
    border-radius: 1rem;
    margin: 2rem auto;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  :global(.prose a) {
    color: #9333EA;
    text-decoration: none;
  }

  :global(.prose a:hover) {
    color: #6b21a8;
    text-decoration: underline;
  }

  :global(.prose h2) {
    font-size: 1.75rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #4B5563;
  }

  :global(.prose h3) {
    font-size: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #4B5563;
  }

  :global(.prose blockquote) {
    border-left: 4px solid #9333EA;
    padding-left: 1rem;
    color: #6B7280;
    font-style: italic;
  }

  @media (max-width: 640px) {
    :global(.prose) {
      font-size: 1rem;
      line-height: 1.7;
    }

    :global(.prose h2) {
      font-size: 1.5rem;
    }

    :global(.prose h3) {
      font-size: 1.25rem;
    }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>