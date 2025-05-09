<script lang="ts">
  // SEO Component for Perth Glory News

  export let title = "Perth Glory News";
  export let description = "Latest news and updates about Perth Glory Football Club";
  export let keywords = "Perth Glory, Football, A-League, Soccer";
  export let image = "/images/default-banner.jpg";
  export let url = "";
  export let canonical = "";
  export let type = "website";
  export let publishedTime = "";
  export let modifiedTime = "";
  export let article: any = null;
  export let twitterCard = "summary_large_image";

  // Get current URL if not provided
  if (!url && typeof window !== 'undefined') {
    url = window.location.href;
  }

  // Set canonical URL if not provided
  if (!canonical && typeof window !== 'undefined') {
    canonical = window.location.href;
  }
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  <!-- Canonical Link -->
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:url" content={url} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  <!-- Article Specific Meta Tags -->
  {#if type === 'article'}
    {#if publishedTime}
      <meta property="article:published_time" content={publishedTime} />
    {/if}
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime} />
    {/if}
    {#if article && article.tags && article.tags.length}
      {#each article.tags as tag}
        <meta property="article:tag" content={tag} />
      {/each}
    {/if}
  {/if}
</svelte:head>
