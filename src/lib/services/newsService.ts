import type { NewsItem } from '$lib/types';

const GLORY_BLOG_API = 'https://www.perthglory.com.au/wp-json/wp/v2';

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        const response = await fetch(`${GLORY_BLOG_API}/posts?_embed=true&per_page=36&orderby=date&order=desc`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        return posts.map((post: any) => ({
            id: post.id.toString(),
            title: post.title.rendered,
            summary: post.excerpt.rendered
                .replace(/<[^>]*>/g, '')
                .slice(0, 200) + '...',
            content: post.content.rendered,
            date: new Date(post.date).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Club News',
            imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/placeholder-news.jpg'
        }));
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
} 