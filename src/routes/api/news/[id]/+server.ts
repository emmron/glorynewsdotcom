import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NewsFetcher } from '$lib/services/newsFetcher';
import type { Article } from '$lib/types/news';

// Convert our Article type to the format expected by the frontend
function transformArticleForResponse(article: Article) {
  // Make sure we handle dates properly
  const publishDate = article.publishDate instanceof Date
    ? article.publishDate
    : new Date(article.publishDate);

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    summary: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    date: publishDate.toISOString(),
    imageUrl: article.images.featured || '/images/default-news.jpg',
    category: article.categories[0] || 'News',
    source: 'Perth Glory',
    sourceUrl: article.sourceUrl,
    author: article.author || 'Perth Glory News',

    // Add fields to match what the frontend expects
    slug: article.id,
    excerpt: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    publishDate: publishDate.toISOString(),
    featuredImage: article.images.featured || '/images/default-news.jpg',
    sourceName: 'Perth Glory',
    readTime: article.metadata.readingTime,
    scrapedAt: publishDate.toISOString(),
    lastModified: publishDate.toISOString(),
    tags: article.tags,
    status: 'published'
  };
}

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return json({ error: "Article ID is required" }, { status: 400 });
  }

  try {
    console.log(`Fetching article with ID: ${id}`);
    const newsFetcher = new NewsFetcher();
    const article = await newsFetcher.getArticleById(id);

    if (!article) {
      console.log(`Article with ID ${id} not found`);
      return json({ error: "Article not found" }, { status: 404 });
    }

    console.log(`Returning article: ${article.title}`);
    return json({ article });
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return json({
      error: "Failed to fetch article",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};