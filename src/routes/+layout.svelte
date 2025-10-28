<script lang="ts">
  import '../app.css';
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import registerServiceWorker from '$lib/pwa/registerServiceWorker';
  import type { PageData } from './$types';

  export let data: PageData;

  let darkMode = false;
  let mobileMenuOpen = false;
  let loggingOut = false;
  $: isAuthenticated = Boolean(data.user);

  const navLinks = [
    { href: '/#discover', label: 'Discover' },
    { href: '/#drops', label: 'Drops' },
    { href: '/#join', label: 'Become a creator' },
    { href: '/offline', label: 'Offline mode' }
  ];

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      darkMode = true;
      document.documentElement.classList.add('dark');
    }

    if (!dev) {
      registerServiceWorker();
    }
  });

  const toggleTheme = () => {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen = !mobileMenuOpen;
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    loggingOut = true;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await invalidateAll();
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      loggingOut = false;
      mobileMenuOpen = false;
    }
  };

  $: currentPath = $page.url.pathname;
  $: currentHash = $page.url.hash;

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return currentHash === href.slice(1);
    }
    return currentPath === href;
  };
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content={darkMode ? '#0f172a' : '#0ea5e9'} />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/images/pwa/icon-192x192.png" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
  <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
    <nav class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
            F
          </span>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">Fanside</p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Free creator network</p>
          </div>
        </a>
        <div class="hidden items-center gap-1 lg:flex">
          {#each navLinks as link}
            <a
              href={link.href}
              class={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {link.label}
            </a>
          {/each}
        </div>
      </div>

      <div class="hidden items-center gap-3 lg:flex">
        <button
          aria-label="Toggle theme"
          class="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          on:click={toggleTheme}
        >
          {#if darkMode}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293a8 8 0 01-11.586-11.586 1 1 0 00-1.32-1.497 10 10 0 1014.203 14.203 1 1 0 10-1.297-1.12z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
            </svg>
          {/if}
        </button>
        {#if isAuthenticated}
          <span class="text-sm font-medium text-slate-600 dark:text-slate-200">
            Hi, {data.user?.username}
          </span>
          <button
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            on:click={handleLogout}
            disabled={loggingOut}
          >
            {#if loggingOut}
              Logging out…
            {:else}
              Log out
            {/if}
          </button>
        {:else}
          <a
            href="/forum"
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          >
            Log in
          </a>
          <a
            href="#join"
            class="rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Join free
          </a>
        {/if}
      </div>

      <div class="flex items-center gap-2 lg:hidden">
        <button
          aria-label="Toggle theme"
          class="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          on:click={toggleTheme}
        >
          {#if darkMode}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293a8 8 0 01-11.586-11.586 1 1 0 00-1.32-1.497 10 10 0 1014.203 14.203 1 1 0 10-1.297-1.12z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
            </svg>
          {/if}
        </button>
        <button
          class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          on:click={toggleMobileMenu}
          aria-label="Open navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>

    {#if mobileMenuOpen}
      <div class="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg dark:border-slate-700 dark:bg-slate-900/95 lg:hidden">
        <div class="flex flex-col gap-2">
          {#each navLinks as link}
            <a
              href={link.href}
              class="rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              on:click={() => {
                mobileMenuOpen = false;
              }}
            >
              {link.label}
            </a>
          {/each}
          {#if isAuthenticated}
            <div class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-200">
              Signed in as <span class="font-semibold">{data.user?.username}</span>
            </div>
            <button
              class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              on:click={handleLogout}
              disabled={loggingOut}
            >
              {#if loggingOut}
                Logging out…
              {:else}
                Log out
              {/if}
            </button>
          {:else}
            <a href="/forum" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200">
              Log in
            </a>
            <a href="#join" class="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
              Join free
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </header>

  <main class="flex-grow">
    <div class="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>

  <footer class="border-t border-slate-200 bg-white/80 py-12 text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
    <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div class="space-y-4">
        <a href="/" class="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
            F
          </span>
          <div>
            <p class="font-semibold">Fanside</p>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Creator network</p>
          </div>
        </a>
        <p class="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Fanside helps creators grow communities with free-access drops, real-time updates, and monetization that respects fans.
        </p>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Product</h3>
        <ul class="mt-4 space-y-3">
          <li><a href="#drops" class="hover:text-slate-800 dark:hover:text-white">Live drops</a></li>
          <li><a href="#discover" class="hover:text-slate-800 dark:hover:text-white">Discover creators</a></li>
          <li><a href="#join" class="hover:text-slate-800 dark:hover:text-white">Creator tools</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Company</h3>
        <ul class="mt-4 space-y-3">
          <li><a href="#" class="hover:text-slate-800 dark:hover:text-white">About</a></li>
          <li><a href="#" class="hover:text-slate-800 dark:hover:text-white">Press kit</a></li>
          <li><a href="#" class="hover:text-slate-800 dark:hover:text-white">Community guidelines</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Get the app</h3>
        <div class="mt-4 space-y-3">
          <a href="#" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 384 512" fill="currentColor">
              <path d="M318.7 268.7c-.4-37.3 16.4-65.6 44.6-86.1-16.8-24.6-41.9-38.4-76.1-41.1-31.9-2.5-66 18.9-78.5 18.9-12.7 0-41.5-18.1-64.3-17.6-49.5.8-102.1 36.2-102.1 108.7 0 32.2 11.8 66.5 26.3 88.6 11.6 18.2 25.5 38.6 43.8 38 17.6-.8 24.2-11.3 45.5-11.3 21.3 0 27.2 11.3 45.8 11 18.8-.3 30.6-18.3 42-36.5 13.3-20.3 18.7-40 19-41.1-.4-.2-36.5-14-36.9-55.5zm-66-132.4c14-16.9 23.4-40.5 20.8-64.3-20.1.8-44.5 13.4-58.9 30.2-13 15.1-24.4 39.5-21.3 62.7 22.4 1.7 45.4-11.4 59.4-28.6z" />
            </svg>
            App Store
          </a>
          <a href="#" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 512 512" fill="currentColor">
              <path d="M325.3 234.3L104.6 13.6C97.5 6.5 88.1 2.2 78.4 0.8L301.8 224.2 325.3 234.3zM47.6 0.3C21.3-1.8 0 19.5 0 45.7V466.3c0 26.2 21.3 47.5 47.6 45.4L280.6 288 47.6 0.3zM311.6 287.2l-30.8 31 113.1 113.1 34.1-18.9c13.6-7.5 22-21.8 22-37.4V177.6c0-15.6-8.4-29.9-22-37.4l-34.1-18.9-82.4 82.4 35.9 35.9c12.7 12.7 12.7 33.3 0 46l-35.8 35.8zM78.4 511.2c9.7-1.4 19.1-5.7 26.2-12.8L301.8 287.2l-223.4 223.4c9.7 1.4 19.1-5.7 26.2-12.8L301.8 287.2 78.4 511.2z" />
            </svg>
            Google Play
          </a>
        </div>
      </div>
    </div>
    <div class="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-800">
      © {new Date().getFullYear()} Fanside. Crafted for creators who launch with community-first content.
    </div>
  </footer>
</div>
