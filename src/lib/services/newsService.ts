import type { NewsItem } from '$lib/types';

const WORDPRESS_API = 'https://www.perthglory.com.au/wp-json/wp/v2';

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        const response = await fetch(`${WORDPRESS_API}/posts?categories=1&per_page=9&_embed`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const posts = await response.json();
        
        return posts.map((post: any) => ({
            id: post.id.toString(),
            title: post.title.rendered,
            summary: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
            content: post.content.rendered,
            date: new Date(post.date).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            category: post._embedded['wp:term']?.[0]?.[0]?.name || 'News',
            imageUrl: post._embedded['wp:featuredmedia']?.[0]?.source_url || '/images/news/default-news.svg'
        }));
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
} 