import { fetchArticles } from '$lib/services/articleService';
import type { Article } from '$lib/types/news';

const SITE_URL = 'https://perthglorynews.com';

export async function GET() {
  // Get all articles from the database
  const articles = await fetchArticles();

  // Map URL data
  const pages = [
    { url: '/', lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'daily' },
    { url: '/ladder', lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'daily' },
    // Add other static pages here
  ];

  // Add article pages
  articles.forEach((article: Article) => {
    const lastMod = article.publishDate;

    pages.push({
      url: `/article/${article.id}`,
      lastmod: lastMod ? new Date(lastMod).toISOString() : new Date().toISOString(),
      priority: '0.7',
      changefreq: 'weekly'
    });
  });

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600, s-maxage=86400'
    }
  });
}
