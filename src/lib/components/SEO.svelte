<script lang="ts">
  export let title = 'Perth Glory News';
  export let description = 'Latest news and updates about Perth Glory Football Club';
  export let url = '';
  export let image = '';
  export let article = null;
  export let publishedTime = '';
  export let modifiedTime = '';
  export let type = 'website';
  export let keywords = 'Perth Glory, Football, A-League, Soccer, Perth Glory News';
  export let canonical = '';

  import { page } from '$app/stores';

  // Fallback canonical URL if not provided
  $: canonicalUrl = canonical || $page.url.href;

  // Prep structured data
  $: structuredData = article ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage ? [article.featuredImage] : [],
    datePublished: article.publishDate,
    dateModified: article.lastModified || article.scrapedAt,
    author: {
      '@type': 'Organization',
      name: article.sourceName || 'Perth Glory News'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Perth Glory News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://perthglorynews.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Perth Glory News',
    description: description,
    url: canonicalUrl
  };
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  <!-- Canonical URL -->
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {#if image}
    <meta property="og:image" content={image} />
  {/if}

  <!-- Twitter -->
  <meta property="twitter:card" content={image ? "summary_large_image" : "summary"} />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  {#if image}
    <meta property="twitter:image" content={image} />
  {/if}

  <!-- Article-specific meta tags -->
  {#if type === 'article'}
    {#if publishedTime}
      <meta property="article:published_time" content={publishedTime} />
    {/if}
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime} />
    {/if}
    <meta property="article:section" content="Sports" />
    <meta property="article:tag" content="Perth Glory" />
    <meta property="article:tag" content="Football" />
    <meta property="article:tag" content="A-League" />
  {/if}

  <!-- JSON-LD structured data -->
  <script type="application/ld+json">
    {JSON.stringify(structuredData)}
  </script>

  <!-- Preconnect to important domains -->
  <link rel="preconnect" href="https://perthglory.com.au" />
  <link rel="preconnect" href="https://keepup.com.au" />
  <link rel="dns-prefetch" href="https://perthglory.com.au" />
  <link rel="dns-prefetch" href="https://keepup.com.au" />
</svelte:head>
