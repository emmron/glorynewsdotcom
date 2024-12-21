<script lang="ts">
  import { page } from '$app/stores';
  import { error } from '@sveltejs/kit';
  
  const GLORY_BLOG_API = 'https://www.perthglory.com.au/wp-json/wp/v2';
  
  interface WordPressPost {
    title: {
      rendered: string;
    };
    content: {
      rendered: string;
    };
    date: string;
    _embedded?: {
      'wp:term'?: Array<Array<{ name: string }>>;
      'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
  }

  let post: WordPressPost | null = null;
  let loading = true;
  let errorMessage = '';

  async function loadPost() {
    try {
      const response = await fetch(
        `${GLORY_BLOG_API}/posts/${$page.params.id}?_embed=true`
      );

      if (!response.ok) {
        throw error(response.status, {
          message: `Failed to load article. Status: ${response.status}`
        });
      }

      const data = await response.json();
      
      if (!data) {
        throw error(404, {
          message: 'Article not found'
        });
      }

      post = data;
    } catch (e) {
      console.error('Error fetching article:', e);
      errorMessage = 'Failed to load article. Please try again later.';
    } finally {
      loading = false;
    }
  }

  loadPost();
</script>

<svelte:head>
  <title>{post ? post.title.rendered : 'Loading...'} | Perth Glory News</title>
  <meta name="description" content={post ? `Read about ${post.title.rendered}` : 'Perth Glory news article'} />
</svelte:head>

<div class="news-page">
  <main class="news-page__main">
    {#if loading}
      <div class="news-page__loader">
        <div class="news-page__spinner"></div>
      </div>
    {:else if errorMessage}
      <div class="error-message">
        <h2 class="error-message__title">Oops!</h2>
        <p class="error-message__text">{errorMessage}</p>
        <a href="/news" class="error-message__button">
          Return to News
        </a>
      </div>
    {:else if post}
      <article class="article">
        <div class="article__back-link-container">
          <a href="/news" class="article__back-link">
            <svg 
              class="article__back-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to News
          </a>
        </div>

        <div class="article__content">
          {#if post._embedded?.['wp:featuredmedia']?.[0]?.source_url}
            <div class="article__image-container">
              <img 
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post.title.rendered}
                class="article__image"
                loading="eager"
              />
            </div>
          {/if}

          <div class="article__body">
            <div class="article__inner">
              <header class="article__header">
                <div class="article__meta">
                  <span class="article__category">
                    {post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News'}
                  </span>
                  <time class="article__date" datetime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <h1 class="article__title">
                  {@html post.title.rendered}
                </h1>
              </header>

              <div class="article__content-body">
                {@html post.content.rendered}
              </div>

              <footer class="article__footer">
                <a href="/news" class="article__view-all">
                  View All News
                </a>
              </footer>
            </div>
          </div>
        </div>
      </article>
    {/if}
  </main>
</div>

<style>
  .news-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%);
  }

  .news-page__main {
    max-width: 80rem;
    margin: 0 auto;
    width: 100%;
    padding: 2rem 1rem;
  }

  .news-page__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .news-page__spinner {
    width: 4rem;
    height: 4rem;
    border: 4px solid #E9D5FF;
    border-top-color: #9333EA;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .error-message {
    max-width: 42rem;
    margin: 0 auto;
    background-color: #FEF2F2;
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .error-message__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #B91C1C;
    margin-bottom: 0.75rem;
  }

  .error-message__text {
    color: #DC2626;
    margin-bottom: 1.5rem;
  }

  .error-message__button {
    display: inline-flex;
    padding: 0.75rem 2rem;
    background-color: #9333EA;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .error-message__button:hover {
    background-color: #7E22CE;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .article {
    max-width: 64rem;
    margin: 0 auto;
  }

  .article__back-link-container {
    margin-bottom: 1.5rem;
  }

  .article__back-link {
    display: inline-flex;
    align-items: center;
    color: #9333EA;
    font-weight: 500;
    transition: color 0.2s;
  }

  .article__back-link:hover {
    color: #7E22CE;
  }

  .article__back-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
    transform: translateX(0);
    transition: transform 0.2s;
  }

  .article__back-link:hover .article__back-icon {
    transform: translateX(-0.25rem);
  }

  .article__content {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .article__image-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .article__image {
    width: 100%;
    max-width: 600px;
    height: 200px;
    object-fit: cover;
  }

  .article__body {
    padding: 1rem;
  }

  .article__inner {
    max-width: 600px;
    margin: 0 auto;
  }

  .article__header {
    margin-bottom: 2rem;
  }

  .article__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .article__category {
    display: inline-flex;
    padding: 0.375rem 1rem;
    background-color: #F3E8FF;
    color: #6D28D9;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 9999px;
  }

  .article__date {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .article__title {
    font-size: 2.25rem;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
  }

  .article__content-body {
    font-size: 1.125rem;
    line-height: 1.75;
    color: #374151;
  }

  .article__content-body :global(h1),
  .article__content-body :global(h2),
  .article__content-body :global(h3) {
    color: #111827;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .article__content-body :global(p) {
    margin-bottom: 1.5rem;
  }

  .article__content-body :global(a) {
    color: #9333EA;
    text-decoration: none;
  }

  .article__content-body :global(a:hover) {
    color: #7E22CE;
  }

  .article__content-body :global(img) {
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 2rem auto;
  }

  .article__footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #E5E7EB;
  }

  .article__view-all {
    display: inline-flex;
    padding: 0.625rem 1.5rem;
    background-color: #9333EA;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .article__view-all:hover {
    background-color: #7E22CE;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 640px) {
    .news-page__main {
      padding: 3rem 1.5rem;
    }

    .article__body {
      padding: 2rem;
    }

    .article__image {
      height: 300px;
    }
  }

  @media (min-width: 1024px) {
    .news-page__main {
      padding: 4rem 2rem;
    }

    .article__body {
      padding: 3rem;
    }

    .article__image {
      height: 400px;
    }

    .article__title {
      font-size: 3rem;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>