import type { NewsItem } from '$lib/types';

const GLORY_BLOG_API = 'https://www.perthglory.com.au/wp-json/wp/v2';

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        // Fetch both general news and NSL articles
        const [generalNews, nslNews] = await Promise.all([
            fetch(`${GLORY_BLOG_API}/posts?_embed=true&per_page=24&orderby=date&order=desc`),
            fetch(`${GLORY_BLOG_API}/posts?_embed=true&per_page=12&orderby=date&order=desc&categories=nsl`)
        ]);
        
        if (!generalNews.ok || !nslNews.ok) {
            throw new Error(`HTTP error! status: ${generalNews.status} ${nslNews.status}`);
        }
        
        const [generalPosts, nslPosts] = await Promise.all([
            generalNews.json(),
            nslNews.json()
        ]);
        
        // Combine and sort all posts by date
        const allPosts = [...generalPosts, ...nslPosts].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        return allPosts.map((post: any) => ({
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