import type { NewsItem } from '$lib/types';

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        const response = await fetch('https://www.perthglory.com.au/wp-json/wp/v2/posts?_embed&per_page=30');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const posts = await response.json();
        
        return posts.map((post: any) => ({
            id: post.id.toString(),
            title: post.title.rendered,
            summary: post.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
            content: post.content.rendered,
            date: new Date(post.date).toLocaleDateString('en-AU'),
            category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'News',
            imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                     post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url || null
        }));
    } catch (error) {
        console.error('Error fetching news:', error);
        // Return static fallback data if API fails
        return [
            {
                id: "1",
                title: "Perth Glory Latest News",
                summary: "Stay tuned for the latest updates from Perth Glory.",
                content: "Content will be available soon.",
                date: new Date().toLocaleDateString('en-AU'),
                category: "News",
                imageUrl: null
            }
        ];
    }
} 