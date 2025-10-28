<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import SEO from '$lib/components/SEO.svelte';
  import type { Creator } from '$lib/types/creator';
  import type { Post } from '$lib/types/post';
  import type { Category } from '$lib/types/category';

  interface PageStats {
    totalCreators: number;
    totalFollowers: number;
    totalLikes: number;
    totalPosts: number;
    totalViews: number;
  }

  interface PageData {
    creators: Creator[];
    trendingCreators: Creator[];
    posts: Post[];
    categories: Category[];
    stats: PageStats;
  }

  export let data: PageData;

  let search = '';
  let selectedCategory = 'all';
  let showOnlineOnly = false;

  const categoryOptions = [{ slug: 'all', title: 'All categories' }, ...data.categories];

  const formatCompactNumber = (value: number) =>
    Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);

  const storyCreators = data.trendingCreators.length ? data.trendingCreators : data.creators.slice(0, 6);

  $: creatorMap = new Map(data.creators.map((creator) => [creator.id, creator]));
  $: onlineCount = data.creators.filter((creator) => creator.status === 'online').length;

  const matchesSearch = (source: string, query: string) => source.toLowerCase().includes(query.toLowerCase());

  $: filteredCreators = data.creators
    .filter((creator) => {
      const categoryMatch =
        selectedCategory === 'all' ||
        creator.categories.some((category) => category.toLowerCase().includes(selectedCategory.toLowerCase()));
      const searchMatch =
        !search ||
        matchesSearch(creator.displayName, search) ||
        matchesSearch(creator.username, search) ||
        creator.featuredTags.some((tag) => matchesSearch(tag, search));
      const statusMatch = !showOnlineOnly || creator.status === 'online';

      return categoryMatch && searchMatch && statusMatch;
    })
    .sort((a, b) => b.followers - a.followers);

  $: enrichedPosts = data.posts
    .map((post) => {
      const creator = creatorMap.get(post.creatorId);
      if (!creator) return null;
      return { post, creator };
    })
    .filter((value): value is { post: Post; creator: Creator } => Boolean(value));

  $: filteredPosts = enrichedPosts.filter(({ post, creator }) => {
    const categoryMatch =
      selectedCategory === 'all' ||
      creator.categories.some((category) => category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      post.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));

    const query = search.trim();
    if (!query) {
      return categoryMatch;
    }

    return (
      categoryMatch &&
      (matchesSearch(creator.displayName, query) ||
        matchesSearch(creator.username, query) ||
        (post.title ? matchesSearch(post.title, query) : false) ||
        matchesSearch(post.body, query) ||
        post.tags.some((tag) => matchesSearch(tag, query)))
    );
  });

  const statusIndicator = (status: Creator['status']) => {
    if (status === 'online') return 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]';
    if (status === 'recent') return 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.25)]';
    return 'bg-slate-400 shadow-[0_0_0_4px_rgba(148,163,184,0.25)]';
  };

  const statusLabel = (status: Creator['status']) => {
    if (status === 'online') return 'Live now';
    if (status === 'recent') return 'Recently active';
    return 'Offline';
  };
</script>

<SEO
  title="Fanside — Free-Access Creator Hub"
  description="Stream fresh drops, connect with creators, and binge exclusive content with zero paywalls. Discover trending talent on Fanside."
  keywords="onlyfans clone, creator platform, subscription content, free onlyfans alternative, premium fan content"
  image={storyCreators[0]?.coverImage ?? storyCreators[0]?.avatar ?? ''}
/>

<div class="space-y-16">
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 text-white shadow-2xl">
    <div class="absolute inset-0 opacity-20 mix-blend-screen">
      <div class="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white blur-3xl"></div>
      <div class="absolute -bottom-32 left-24 h-80 w-80 rounded-full bg-cyan-200 blur-3xl"></div>
    </div>

    <div class="relative z-10 grid gap-12 p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-16">
      <div class="space-y-8">
        <div class="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
          <span class="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300"></span>
          {onlineCount} creators live • All free access
        </div>
        <h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          The free fan platform where creators drop first.
        </h1>
        <p class="max-w-xl text-lg text-sky-50/90">
          Fanside unlocks live drops, studio sessions, and behind-the-scenes content without the paywall.
          Follow creators, binge curated playlists, and DM for collabs — totally free.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <a
            href="#join"
            class="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Join Fanside for free
            <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </a>
          <a
            href="#discover"
            class="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Browse creators
          </a>
        </div>
        <div class="grid gap-6 rounded-2xl bg-white/10 p-6 backdrop-blur lg:grid-cols-3">
          <div>
            <p class="text-2xl font-semibold">{formatCompactNumber(data.stats.totalFollowers)}</p>
            <p class="text-sm text-sky-50/80">Total followers synced across creators</p>
          </div>
          <div>
            <p class="text-2xl font-semibold">{formatCompactNumber(data.stats.totalLikes)}</p>
            <p class="text-sm text-sky-50/80">Creator likes shared this month</p>
          </div>
          <div>
            <p class="text-2xl font-semibold">{formatCompactNumber(data.stats.totalViews)}</p>
            <p class="text-sm text-sky-50/80">Free views streamed in the last 30 days</p>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur"></div>
        <div class="relative space-y-5 rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
          {#each storyCreators as creator (creator.id)}
            <div class="flex items-center justify-between rounded-2xl bg-gradient-to-r from-white via-white to-white/60 p-4 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img src={creator.avatar} alt={creator.displayName} class="h-14 w-14 rounded-full object-cover" loading="lazy" />
                  <span class={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${statusIndicator(creator.status)}`}></span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{creator.displayName}</p>
                  <p class="text-xs text-slate-500">{creator.username}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <p class="text-xs font-medium text-slate-500">{statusLabel(creator.status)}</p>
                <button class="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-blue-600/30 transition hover:bg-blue-500">
                  Follow
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section id="discover" class="grid gap-8 rounded-3xl bg-white/70 p-6 shadow-lg shadow-slate-800/5 backdrop-blur lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Discover creators</h2>
          <p class="text-sm text-slate-500">Search drops, filter by category, and find who is online right now.</p>
        </div>
        <div class="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          {data.stats.totalCreators} creators • {formatCompactNumber(data.stats.totalPosts)} free drops
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <div class="relative">
          <span class="absolute left-3 top-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            bind:value={search}
            placeholder="Search creators, drops, or tags..."
            class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div>
          <select
            class="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            bind:value={selectedCategory}
          >
            {#each categoryOptions as option}
              <option value={option.slug}>{option.title}</option>
            {/each}
          </select>
        </div>
        <label class="flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-sky-300">
          <span class="text-slate-600">Only show live</span>
          <input type="checkbox" bind:checked={showOnlineOnly} class="h-5 w-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400" />
        </label>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#if filteredCreators.length === 0}
          <div class="col-span-full rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-10 text-center text-slate-500">
            No creators match those filters yet. Try a different tag or reset the filters.
          </div>
        {:else}
          {#each filteredCreators.slice(0, 6) as creator (creator.id)}
            <article class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div class="relative h-40 overflow-hidden border-b border-slate-100">
                <img src={creator.coverImage} alt={creator.displayName} class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent"></div>
                <div class="absolute bottom-4 left-4 flex items-center gap-3">
                  <div class="relative">
                    <img src={creator.avatar} alt={creator.displayName} class="h-12 w-12 rounded-full border-2 border-white object-cover" loading="lazy" />
                    <span class={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${statusIndicator(creator.status)}`}></span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{creator.displayName}</p>
                    <p class="text-xs text-white/80">{creator.username}</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-1 flex-col justify-between p-5">
                <div class="space-y-3">
                  <p class="text-sm text-slate-500">{creator.bio}</p>
                  <div class="flex flex-wrap gap-2">
                    {#each creator.featuredTags.slice(0, 3) as tag (tag)}
                      <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">#{tag}</span>
                    {/each}
                  </div>
                </div>
                <div class="mt-6 flex items-center justify-between text-xs text-slate-500">
                  <div class="space-y-1">
                    <p><span class="font-semibold text-slate-800">{formatCompactNumber(creator.followers)}</span> followers</p>
                    <p>{creator.location}</p>
                  </div>
                  <button class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sky-500/30 transition hover:bg-sky-400">
                    Subscribe free
                  </button>
                </div>
              </div>
            </article>
          {/each}
        {/if}
      </div>
    </div>

    <aside class="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-700">Top categories</h3>
      <div class="grid gap-4">
        {#each data.categories as category (category.slug)}
          <div class={`rounded-2xl bg-gradient-to-br ${category.gradient} p-4 text-white shadow-lg`}>
            <div class="flex items-center justify-between">
              <span class="text-2xl">{category.icon}</span>
              <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">Trending</span>
            </div>
            <h4 class="mt-3 text-lg font-semibold">{category.title}</h4>
            <p class="mt-1 text-xs text-white/85">{category.description}</p>
          </div>
        {/each}
      </div>
      <div class="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-sky-700">
        Creators can sync Patreon, Twitch, or YouTube in one tap. Fans get unified drops in real-time.
      </div>
    </aside>
  </section>

  <section id="drops" class="space-y-6 rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/50">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold">Fresh free drops</h2>
        <p class="text-sm text-slate-300">Stream the latest unlocks from creators you follow — no paywalls, no previews.</p>
      </div>
      <a href="#discover" class="inline-flex items-center text-sm font-semibold text-sky-300 hover:text-sky-200">
        Filter creators
        <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
        </svg>
      </a>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      {#each filteredPosts as { post, creator } (post.id)}
        <article class="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-slate-700">
          <header class="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="relative">
                <img src={creator.avatar} alt={creator.displayName} class="h-12 w-12 rounded-full border-2 border-slate-800 object-cover" loading="lazy" />
                <span class={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${statusIndicator(creator.status)}`}></span>
              </div>
              <div>
                <p class="text-sm font-semibold text-white">{creator.displayName}</p>
                <p class="text-xs text-slate-400">{creator.username}</p>
              </div>
            </div>
            <div class="text-right text-xs text-slate-400">
              <p>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
              <p>{creator.location}</p>
            </div>
          </header>

          {#if post.media}
            <div class="relative overflow-hidden" style:aspect-ratio={post.media.aspectRatio}>
              {#if post.media.type === 'image'}
                <img src={post.media.sources[0]} alt={post.title ?? 'Creator post'} class="h-full w-full object-cover" loading="lazy" />
              {:else if post.media.type === 'gallery'}
                <div class="grid grid-cols-2 gap-1 bg-black">
                  {#each post.media.sources.slice(0, 4) as source, index (source)}
                    <img
                      src={source}
                      alt={`${post.title ?? creator.displayName} preview ${index + 1}`}
                      class="h-48 w-full object-cover lg:h-56"
                      loading="lazy"
                    />
                  {/each}
                </div>
              {:else if post.media.type === 'video'}
                <video
                  class="h-full w-full object-cover"
                  controls
                  poster={post.media.poster}
                >
                  {#each post.media.sources as source (source)}
                    <source src={source} type="video/mp4" />
                  {/each}
                  Your browser does not support the video tag.
                </video>
              {/if}
            </div>
          {/if}

          <div class="flex flex-1 flex-col gap-5 px-6 py-5">
            <div class="space-y-2">
              {#if post.title}
                <h3 class="text-lg font-semibold">{post.title}</h3>
              {/if}
              <p class="text-sm text-slate-300">{post.body}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each post.tags as tag (tag)}
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">#{tag}</span>
              {/each}
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div class="flex items-center gap-5">
                <span class="inline-flex items-center gap-1 font-medium text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15a7 7 0 0114 0v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1z" />
                  </svg>
                  {formatCompactNumber(post.likes)}
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v9l-4-4H7a2 2 0 01-2-2V6a2 2 0 012-2h7" />
                  </svg>
                  {post.comments}
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 12v4" />
                  </svg>
                  {post.tips}
                </span>
              </div>
              <div class="flex items-center gap-5">
                <span>{formatCompactNumber(post.views)} views</span>
                <button class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-105">
                  Tip creator
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 12v4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section id="join" class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-10 shadow-lg">
    <div class="absolute inset-y-0 right-10 hidden w-64 rotate-12 rounded-3xl bg-gradient-to-b from-sky-400/40 via-blue-400/20 to-transparent blur-3xl md:block"></div>
    <div class="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div class="space-y-6">
        <h2 class="text-3xl font-semibold text-slate-900">Build your fanbase without the paywall friction.</h2>
        <p class="text-base text-slate-600">
          Fanside lets you stack your audience, drop premium media, and manage subscribers across platforms —
          while keeping the experience free for fans. Import your socials, launch live rooms, and automate DMs.
        </p>
        <ul class="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <li class="flex items-start gap-3">
            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">✓</span>
            Auto-sync drops from Twitch, Patreon, and YouTube
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">✓</span>
            Schedule cross-platform announcements and DMs
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">✓</span>
            Monetize via tips, collabs, and sponsor drops
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">✓</span>
            Analytics built for creators, not ad networks
          </li>
        </ul>
        <div class="flex flex-wrap gap-4">
          <a
            href="#"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-slate-900/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Claim your creator page
          </a>
          <a href="#" class="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
            Compare features
          </a>
        </div>
      </div>
      <div class="rounded-3xl border border-sky-100 bg-white p-6 shadow-lg">
        <h3 class="text-sm font-semibold text-slate-700">Creator success snapshots</h3>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl bg-sky-50 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">Aurora Vale</p>
            <p>Scaled to 480k followers with free drops, then converted 16% into paid workshop sign-ups.</p>
          </div>
          <div class="rounded-2xl bg-slate-900 text-slate-200 p-4 text-sm">
            <p class="font-semibold text-white">Kai Rias</p>
            <p>Livestream recaps doubled VOD engagement — 126k free viewers funneled into sponsor offers.</p>
          </div>
          <div class="rounded-2xl bg-sky-100/60 p-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">Amara Sol</p>
            <p>Retreat teasers filled three wellness cohorts via automated DMs — all from free-only drops.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
