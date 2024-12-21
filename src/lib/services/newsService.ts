import type { NewsItem, WordPressPost } from '$lib/types';

const GLORY_BLOG_API = 'https://www.perthglory.com.au/wp-json/wp/v2';

export async function fetchGloryNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `${GLORY_BLOG_API}/posts?` +
      `per_page=9&` +
      `_embed=true`
    );
    
    const posts: WordPressPost[] = await response.json();
    return posts.map((post) => ({
      id: post.id.toString(),
      title: post.title.rendered,
      summary: stripHtmlTags(post.excerpt.rendered),
      date: new Date(post.date).toLocaleDateString(),
      category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News',
      imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/placeholder-news.jpg',
      url: post.link
    }));
  } catch (error) {
    console.error('Error fetching Glory news:', error);
    return [];
  }
}

function stripHtmlTags(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
} 