<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import { invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  // Extract categories and recent threads from the loaded data
  $: categories = data.categories;
  $: recentThreads = data.recentThreads;
  $: currentUser = data.user ?? null;
  $: isLoggedIn = Boolean(currentUser);
  let loginForm = {
    identifier: '',
    password: ''
  };
  let loginError = '';
  let loginLoading = false;
  let logoutError = '';
  let logoutLoading = false;
  $: displayUsername = currentUser?.username ?? '';
  $: displayInitial = displayUsername ? displayUsername.charAt(0).toUpperCase() : 'U';
  $: displayEmail = currentUser?.email ?? '';

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

  function getCategoryById(categoryId: string) {
    return categories.find(cat => cat.id === categoryId);
  }

  async function handleLogin() {
    loginError = '';
    loginLoading = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        loginError = typeof result.error === 'string' ? result.error : 'Unable to log in right now.';
        return;
      }

      loginForm.identifier = '';
      loginForm.password = '';
      await invalidateAll();
    } catch (error) {
      console.error('Login failed', error);
      loginError = 'Unable to log in right now. Please try again.';
    } finally {
      loginLoading = false;
    }
  }

  async function handleLogout() {
    if (logoutLoading) return;

    logoutError = '';
    logoutLoading = true;

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        logoutError = typeof result.error === 'string' ? result.error : 'Failed to log out. Please try again.';
        return;
      }

      await invalidateAll();
    } catch (error) {
      console.error('Logout failed', error);
      logoutError = 'Failed to log out. Please try again.';
    } finally {
      logoutLoading = false;
    }
  }
</script>

<SEO
  title="Forum | Perth Glory News"
  description="Join the discussion with fellow Perth Glory supporters. Talk about the latest matches, player news, and more."
  keywords="Perth Glory, forum, discussion, football, A-League, supporters"
/>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="flex flex-col md:flex-row justify-between items-start gap-6">
    <!-- Main Content -->
    <div class="w-full md:w-3/4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-purple-800">Glory Forum</h1>
        <div>
          {#if isLoggedIn}
            <a href="/forum/new-topic" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium">New Topic</a>
          {:else}
            <button
              class="bg-gray-300 text-gray-600 px-4 py-2 rounded font-medium cursor-not-allowed"
              title="Please login to create a new topic">
              New Topic
            </button>
          {/if}
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-purple-800">Categories</h2>
        </div>
        <div class="divide-y divide-gray-200">
          {#each categories as category}
            <a href={`/forum/category/${category.id}`} class="block hover:bg-gray-50 transition-colors">
              <div class="p-4 flex items-start">
                <div class="bg-purple-100 rounded-full p-3 mr-4">
                  <span class="text-purple-700">
                    <!-- Simple icon placeholder - would use proper icons in production -->
                    {category.icon === 'message-circle' ? '💬' : ''}
                    {category.icon === 'calendar' ? '📅' : ''}
                    {category.icon === 'refresh-cw' ? '🔄' : ''}
                    {category.icon === 'layout' ? '📊' : ''}
                    {category.icon === 'users' ? '👥' : ''}
                    {category.icon === 'award' ? '🏆' : ''}
                  </span>
                </div>
                <div class="flex-grow">
                  <h3 class="font-bold text-gray-900">{category.name}</h3>
                  <p class="text-gray-600 text-sm">{category.description}</p>
                </div>
                <div class="text-right text-sm text-gray-500">
                  <p>{category.threadCount} threads</p>
                  <p>{category.postCount} posts</p>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>

      <!-- Recent Discussions -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-purple-800">Recent Discussions</h2>
        </div>
        <div class="divide-y divide-gray-200">
          {#each recentThreads as thread}
            <div class="p-4 hover:bg-gray-50">
              <div class="flex items-start">
                <div class="flex-grow">
                  <a href={`/forum/thread/${thread.id}`} class="font-bold text-purple-700 hover:text-purple-900 transition-colors">{thread.title}</a>
                  <div class="flex items-center mt-2 text-xs text-gray-500">
                    <span class="px-2 py-1 bg-gray-100 rounded mr-2">{getCategoryById(thread.category)?.name}</span>
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
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-full md:w-1/4">
      <!-- Login/Account Widget -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h3 class="font-bold text-purple-800">{isLoggedIn ? 'My Account' : 'Login'}</h3>
        </div>
        <div class="p-4">
          {#if isLoggedIn}
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl text-purple-700">{displayInitial}</span>
              </div>
              <p class="font-bold">{displayUsername}</p>
              {#if displayEmail}
                <p class="text-sm text-gray-500">{displayEmail}</p>
              {/if}
              <div class="mt-4">
                <a href="/forum/my-profile" class="text-sm text-purple-600 hover:underline block mb-2">My Profile</a>
                <a href="/forum/my-posts" class="text-sm text-purple-600 hover:underline block mb-2">My Posts</a>
                <a href="/forum/notifications" class="text-sm text-purple-600 hover:underline block mb-4">Notifications</a>
                <button
                  on:click={handleLogout}
                  class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm transition"
                  disabled={logoutLoading}
                >
                  {#if logoutLoading}
                    Logging out…
                  {:else}
                    Log Out
                  {/if}
                </button>
              </div>
              {#if logoutError}
                <p class="mt-3 text-sm text-red-600">{logoutError}</p>
              {/if}
            </div>
          {:else}
            <form on:submit|preventDefault={handleLogin} class="space-y-4">
              {#if loginError}
                <div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</div>
              {/if}
              <div>
                <label for="identifier" class="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  id="identifier"
                  bind:value={loginForm.identifier}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                  autocomplete="username"
                  disabled={loginLoading}
                />
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  bind:value={loginForm.password}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                  autocomplete="current-password"
                  disabled={loginLoading}
                />
              </div>
              <div>
                <button
                  type="submit"
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                  class:opacity-75={loginLoading}
                  class:cursor-not-allowed={loginLoading}
                  disabled={loginLoading}
                >
                  {#if loginLoading}
                    Logging in…
                  {:else}
                    Login
                  {/if}
                </button>
              </div>
              <div class="text-center text-sm">
                <a href="/forum/register" class="text-purple-600 hover:underline">Register</a>
                <span class="mx-2">|</span>
                <a href="/forum/forgot-password" class="text-purple-600 hover:underline">Forgot Password?</a>
              </div>
            </form>
          {/if}
        </div>
      </div>

      <!-- Forum Stats -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h3 class="font-bold text-purple-800">Forum Statistics</h3>
        </div>
        <div class="p-4 text-sm">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Total Members:</span>
            <span class="font-medium">3,482</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Total Threads:</span>
            <span class="font-medium">1,295</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Total Posts:</span>
            <span class="font-medium">24,618</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Newest Member:</span>
            <a href="/forum/user/GlorySupporter2023" class="text-purple-600 hover:underline">GlorySupporter2023</a>
          </div>
        </div>
      </div>

      <!-- Online Users -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-purple-50 p-4 border-b border-gray-200">
          <h3 class="font-bold text-purple-800">Who's Online</h3>
        </div>
        <div class="p-4 text-sm">
          <p class="text-gray-600 mb-2">Currently online: <span class="font-medium">42 users</span></p>
          <div class="flex flex-wrap gap-1 text-xs">
            <a href="/forum/user/PerthFan" class="text-purple-600 hover:underline">PerthFan</a>,
            <a href="/forum/user/Glory4Life" class="text-purple-600 hover:underline">Glory4Life</a>,
            <a href="/forum/user/PurplePride" class="text-purple-600 hover:underline">PurplePride</a>,
            <a href="/forum/user/Macca99" class="text-purple-600 hover:underline">Macca99</a>,
            <a href="/forum/user/GloryDays94" class="text-purple-600 hover:underline">GloryDays94</a>
            <span>and 37 more...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }
</style>
