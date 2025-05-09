import type { Article } from '../types/news';

interface MetaTagData {
  title: string;
  description: string;
  image: string;
  type: string;
  url: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags: string[];
}

/**
 * Generates optimized metadata for an article
 */
export function generateArticleMeta(article: Article, baseUrl: string): MetaTagData {
  // Create a properly truncated description
  const description = article.content && article.content.length > 20
    ? article.content.substring(0, 160) + (article.content.length > 160 ? '...' : '')
    : 'Read the latest news about Perth Glory Football Club';

  // Ensure proper date formatting
  const publishedTime = article.publishDate ? new Date(article.publishDate).toISOString() : undefined;
  const modifiedTime = publishedTime; // Use publish date as fallback for modified

  return {
    title: article.title,
    description,
    image: article.images.featured || '',
    type: 'article',
    url: `${baseUrl}/article/${article.id}`,
    publishedTime,
    modifiedTime,
    tags: article.tags || ['Perth Glory', 'Football', 'A-League']
  };
}

/**
 * Generates schema.org structured data for an article
 */
export function generateArticleSchema(article: Article, baseUrl: string): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.content.substring(0, 160) + (article.content.length > 160 ? '...' : ''),
    image: article.images.featured ? [article.images.featured] : [],
    datePublished: article.publishDate ? new Date(article.publishDate).toISOString() : new Date().toISOString(),
    dateModified: article.publishDate ? new Date(article.publishDate).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: article.author || 'Perth Glory News'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Perth Glory News',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/article/${article.id}`
    }
  };
}
