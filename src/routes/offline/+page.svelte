<script>
  import { onMount } from 'svelte';

  let isOnline = true;

  onMount(() => {
    isOnline = navigator.onLine;

    const handleOnline = () => { isOnline = true; };
    const handleOffline = () => { isOnline = false; };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

<svelte:head>
  <title>Offline | Perth Glory News</title>
  <meta name="description" content="You are currently offline" />
</svelte:head>

<div class="offline-page min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-md mx-auto">
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
        <svg class="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">You're Offline</h1>

      <p class="text-gray-600 mb-6">
        It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
      </p>

      {#if isOnline}
        <div class="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
          You're back online!
          <a href="/" class="text-green-800 font-medium underline">Refresh the page</a>
          to see the latest content.
        </div>
      {/if}

      <a
        href="/"
        class="inline-block px-5 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors mt-2"
      >
        Try Again
      </a>
    </div>

    <p class="text-sm text-gray-500">
      Perth Glory News - Your source for all things Glory, even offline!
    </p>
  </div>
</div>