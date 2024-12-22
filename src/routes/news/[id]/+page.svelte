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
    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .error-message {
    max-width: 42rem;
    margin: 2rem auto;
    background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
    border-radius: 1rem;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 8px 16px -4px rgba(185, 28, 28, 0.1);
    border: 1px solid rgba(185, 28, 28, 0.1);
  }

  .error-message__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #991B1B;
    margin-bottom: 1rem;
    text-shadow: 0 1px 2px rgba(185, 28, 28, 0.1);
  }

  .error-message__text {
    color: #B91C1C;
    margin-bottom: 2rem;
    font-size: 1.125rem;
    line-height: 1.6;
  }

  .error-message__button {
    display: inline-flex;
    padding: 0.875rem 2.5rem;
    background: linear-gradient(135deg, #9333EA 0%, #7E22CE 100%);
    color: white;
    font-weight: 600;
    border-radius: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px -2px rgba(147, 51, 234, 0.3);
  }

  .error-message__button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(147, 51, 234, 0.4);
    background: linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%);
  }

  .article {
    max-width: 64rem;
    margin: 0 auto;
    animation: fadeIn 0.6s ease-out;
  }

  .article__back-link-container {
    margin-bottom: 2rem;
  }

  .article__back-link {
    display: inline-flex;
    align-items: center;
    color: #9333EA;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }

  .article__back-link:hover {
    color: #7E22CE;
    background-color: rgba(147, 51, 234, 0.08);
  }

  .article__back-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
    transform: translateX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .article__back-link:hover .article__back-icon {
    transform: translateX(-0.375rem);
  }

  .article__content {
    background: white;
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(147, 51, 234, 0.08);
    transition: box-shadow 0.3s ease;
  }

  .article__content:hover {
    box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.15);
  }

  .article__image-container {
    width: 100%;
    display: flex;
    justify-content: center;
    background: linear-gradient(135deg, #F3E8FF 0%, #FAF5FF 100%);
  }

  .article__image {
    width: 100%;
    max-width: 800px;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .article__image:hover {
    transform: scale(1.02);
  }

  .article__body {
    padding: 1.5rem;
    background: linear-gradient(180deg, rgba(250, 245, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  }

  .article__inner {
    max-width: 700px;
    margin: 0 auto;
  }

  .article__header {
    margin-bottom: 2.5rem;
  }

  .article__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .article__category {
    display: inline-flex;
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%);
    color: #6D28D9;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 9999px;
    box-shadow: 0 2px 4px rgba(109, 40, 217, 0.1);
    transition: all 0.3s ease;
  }

  .article__category:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(109, 40, 217, 0.15);
  }

  .article__date {
    color: #6B7280;
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .article__title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #111827;
    line-height: 1.2;
    letter-spacing: -0.02em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .article__content-body {
    font-size: 1.1875rem;
    line-height: 1.8;
    color: #374151;
    letter-spacing: 0.01em;
  }

  .article__content-body :global(h1),
  .article__content-body :global(h2),
  .article__content-body :global(h3) {
    color: #111827;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .article__content-body :global(p) {
    margin-bottom: 1.75rem;
  }

  .article__content-body :global(a) {
    color: #9333EA;
    text-decoration: none;
    border-bottom: 2px solid rgba(147, 51, 234, 0.2);
    transition: all 0.2s ease;
  }

  .article__content-body :global(a:hover) {
    color: #7E22CE;
    border-bottom-color: #7E22CE;
  }

  .article__content-body :global(img) {
    border-radius: 0.75rem;
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.15);
    max-width: 700px;
    margin: 2.5rem auto;
    transition: transform 0.3s ease;
  }

  .article__content-body :global(img:hover) {
    transform: scale(1.02);
  }

  .article__footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 2px solid rgba(147, 51, 234, 0.1);
  }

  .article__view-all {
    display: inline-flex;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #9333EA 0%, #7E22CE 100%);
    color: white;
    font-weight: 600;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px -2px rgba(147, 51, 234, 0.3);
  }

  .article__view-all:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(147, 51, 234, 0.4);
    background: linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%);
  }

  @media (min-width: 640px) {
    .news-page__main {
      padding: 3rem 2rem;
    }

    .article__body {
      padding: 2.5rem;
    }

    .article__image {
      height: 350px;
    }
  }

  @media (min-width: 1024px) {
    .news-page__main {
      padding: 4rem 2.5rem;
    }

    .article__body {
      padding: 3.5rem;
    }

    .article__image {
      height: 450px;
    }

    .article__title {
      font-size: 3.25rem;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>