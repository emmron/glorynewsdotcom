<script>
  import { createEventDispatcher } from 'svelte';

  export let clubs = [];
  export let selected = 'All Clubs';

  const dispatch = createEventDispatcher();

  function handleSelect(club) {
    selected = club;
    dispatch('select', club);
  }
</script>

<div class="club-filter">
  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Filter by Club</h3>
  <div class="flex flex-wrap gap-2">
    {#each clubs as club}
      <button
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {
          selected === club
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        }"
        on:click={() => handleSelect(club)}
        aria-pressed={selected === club}
      >
        {club}
      </button>
    {/each}
  </div>
</div>

<style>
  .club-filter {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  :global(.dark) .club-filter {
    background-color: #1f2937;
  }
</style>