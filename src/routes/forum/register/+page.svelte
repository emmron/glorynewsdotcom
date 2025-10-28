<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  let form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  let formError = '';
  let formLoading = false;
  let formSuccess = '';

  $: currentUser = data.user ?? null;
  $: isLoggedIn = Boolean(currentUser);
  $: formDisabled = formLoading || isLoggedIn;

  async function handleSignup() {
    if (formLoading) return;

    if (isLoggedIn) {
      formError = 'Please log out before creating a new account.';
      return;
    }

    formError = '';
    formSuccess = '';

    if (form.password !== form.confirmPassword) {
      formError = 'Passwords do not match.';
      return;
    }

    formLoading = true;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        formError = typeof result.error === 'string' ? result.error : 'Unable to create your account right now.';
        return;
      }

      formSuccess = 'Account created successfully! Redirecting to the forum…';
      await invalidateAll();
      await goto('/forum');
    } catch (error) {
      console.error('Signup failed', error);
      formError = 'Something went wrong while creating your account. Please try again.';
    } finally {
      formLoading = false;
    }
  }
</script>

<SEO
  title="Create an account | Glory Forum"
  description="Join the Glory Forum community to take part in match discussions, transfer talk, and more."
  keywords="Perth Glory forum registration, join Perth Glory forum, Perth Glory signup"
/>

<div class="mx-auto w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-lg">
  <h1 class="text-2xl font-bold text-purple-800">Join the Glory Forum</h1>
  <p class="text-sm text-gray-600">
    Create a free account to unlock new thread creation, post replies, and follow the latest Perth Glory discussions.
  </p>

  {#if currentUser}
    <div class="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
      You are currently logged in as <strong>{currentUser.username}</strong>. You can continue browsing the forum or log out from the sidebar.
    </div>
  {/if}

  <form class="space-y-4" on:submit|preventDefault={handleSignup}>
    {#if formError}
      <div class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
    {/if}

    {#if formSuccess}
      <div class="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{formSuccess}</div>
    {/if}

    <div>
      <label for="username" class="mb-1 block text-sm font-medium text-gray-700">Username</label>
      <input
        id="username"
        type="text"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
        bind:value={form.username}
        required
        minlength="3"
        maxlength="20"
        pattern="^[A-Za-z0-9_]+$"
        title="Use letters, numbers, or underscores (3-20 characters)."
        autocomplete="username"
        disabled={formDisabled}
      />
    </div>

    <div>
      <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email address</label>
      <input
        id="email"
        type="email"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
        bind:value={form.email}
        required
        autocomplete="email"
        disabled={formDisabled}
      />
    </div>

    <div>
      <label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
      <input
        id="password"
        type="password"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
        bind:value={form.password}
        required
        minlength="8"
        autocomplete="new-password"
        disabled={formDisabled}
      />
    </div>

    <div>
      <label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
      <input
        id="confirmPassword"
        type="password"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
        bind:value={form.confirmPassword}
        required
        minlength="8"
        autocomplete="new-password"
        disabled={formDisabled}
      />
    </div>

    <button
      type="submit"
      class="w-full rounded-md bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={formDisabled}
    >
      {#if formLoading}
        Creating account…
      {:else}
        Sign up
      {/if}
    </button>

    <p class="text-center text-sm text-gray-600">
      Already have an account?
      <a href="/forum" class="text-purple-600 hover:underline">Return to the forum login</a>
    </p>
  </form>
</div>
