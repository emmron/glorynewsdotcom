<script>
  import "../app.css";
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import registerServiceWorker from '$lib/pwa/registerServiceWorker';

  // Theme switching functionality
  let darkMode = false;

  onMount(() => {
    // Check user preference or saved setting
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      darkMode = true;
      document.documentElement.classList.add('dark');
    }

    // Register service worker for PWA
    if (!dev) {
      registerServiceWorker();
    }
  });

  function toggleTheme() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Mobile menu functionality
  let mobileMenuOpen = false;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#9333EA" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/images/pwa/icon-192x192.png" />
  {#if !dev}
    <!-- Global site tag (gtag.js) - Google Analytics or similar analytics code -->
    <!-- Analytics code would go here in production -->
  {/if}
</svelte:head>

<div class="min-h-screen flex flex-col transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
  <header class="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <a href="/" class="flex items-center space-x-2">
              <span class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-500 dark:to-purple-300">
                Perth Glory News
              </span>
            </a>
          </div>
          <div class="hidden md:ml-8 md:flex md:space-x-6">
            <a
              href="/"
              class="{$page.url.pathname === '/' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150"
            >
              News
            </a>
            <a
              href="/ladder"
              class="{$page.url.pathname.includes('/ladder') ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150"
            >
              Ladder
            </a>
            <a
              href="/forum"
              class="{$page.url.pathname.includes('/forum') ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150"
            >
              Forum
            </a>
            <a
              href="/about"
              class="{$page.url.pathname.includes('/about') ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150"
            >
              About
            </a>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
            aria-label="Toggle dark mode"
            class="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            on:click={toggleTheme}
          >
            {#if darkMode}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            {/if}
          </button>
          <!-- Mobile menu button -->
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            aria-expanded="false"
            on:click={toggleMobileMenu}
          >
            <span class="sr-only">Open main menu</span>
            {#if mobileMenuOpen}
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            {:else}
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile menu, show/hide based on menu state -->
    {#if mobileMenuOpen}
      <div class="md:hidden bg-white dark:bg-gray-800 shadow-lg pb-3 pt-2">
        <div class="px-2 space-y-1">
          <a
            href="/"
            class="{$page.url.pathname === '/' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} block px-3 py-2 rounded-md text-base font-medium"
          >
            News
          </a>
          <a
            href="/ladder"
            class="{$page.url.pathname.includes('/ladder') ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} block px-3 py-2 rounded-md text-base font-medium"
          >
            Ladder
          </a>
          <a
            href="/forum"
            class="{$page.url.pathname.includes('/forum') ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} block px-3 py-2 rounded-md text-base font-medium"
          >
            Forum
          </a>
          <a
            href="/about"
            class="{$page.url.pathname.includes('/about') ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} block px-3 py-2 rounded-md text-base font-medium"
          >
            About
          </a>
        </div>
      </div>
    {/if}
  </header>

  <main class="flex-grow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </div>
  </main>

  <footer class="bg-gray-800 dark:bg-gray-900 text-white py-12 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-purple-300">Perth Glory News</h3>
          <p class="text-gray-400 mb-4">Your source for the latest Perth Glory FC updates and news.</p>
          <div class="flex space-x-4">
            <a href="https://twitter.com/PerthGloryFC" target="_blank" rel="noopener" class="text-gray-400 hover:text-white">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="https://facebook.com/PerthGloryFC" target="_blank" rel="noopener" class="text-gray-400 hover:text-white">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"></path>
              </svg>
            </a>
            <a href="https://instagram.com/perthgloryfc" target="_blank" rel="noopener" class="text-gray-400 hover:text-white">
              <span class="sr-only">Instagram</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4 text-purple-300">Quick Links</h3>
          <ul class="space-y-3 text-gray-400">
            <li><a href="/" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a></li>
            <li><a href="/ladder" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ladder
            </a></li>
            <li><a href="/forum" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Forum
            </a></li>
            <li><a href="/about" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4 text-purple-300">Legal</h3>
          <ul class="space-y-3 text-gray-400">
            <li><a href="/privacy" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Policy
            </a></li>
            <li><a href="/terms" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms of Service
            </a></li>
            <li><a href="/disclaimer" class="hover:text-white transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Disclaimer
            </a></li>
          </ul>
        </div>
      </div>
      <div class="mt-10 pt-8 border-t border-gray-700 text-gray-400 text-sm text-center">
        <p>© {new Date().getFullYear()} Perth Glory News | Not affiliated with Perth Glory Football Club</p>
        <p class="mt-2">This is an independent fan site providing news and information about Perth Glory FC.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(.dark) {
    color-scheme: dark;
  }
</style>