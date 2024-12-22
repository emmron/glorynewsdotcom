import type { NewsItem } from '$lib/types';

const GLORY_BLOG_API = 'https://www.perthglory.com.au/wp-json/wp/v2';

export async function fetchGloryNews(): Promise<NewsItem[]> {
    try {
        // First, fetch all categories to find the NSL category ID
        console.log('Fetching categories...');
        const categoriesResponse = await fetch(`${GLORY_BLOG_API}/categories?per_page=100`);
        if (!categoriesResponse.ok) {
            throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
        }
        const categories = await categoriesResponse.json();
        console.log('Categories:', categories);
        
        const nslCategory = categories.find((cat: any) => 
            cat.name.toLowerCase().includes('nsl') || 
            cat.slug.toLowerCase().includes('nsl')
        );
        console.log('NSL Category:', nslCategory);

        // Fetch general news
        console.log('Fetching general news...');
        const response = await fetch(`${GLORY_BLOG_API}/posts?_embed=true&per_page=36&orderby=date&order=desc${nslCategory ? `&categories_exclude=${nslCategory.id}` : ''}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let allPosts = await response.json();
        console.log('General posts:', allPosts.length);

        // If we found an NSL category, fetch those posts separately
        if (nslCategory) {
            console.log('Fetching NSL news...');
            const nslResponse = await fetch(`${GLORY_BLOG_API}/posts?_embed=true&per_page=12&orderby=date&order=desc&categories=${nslCategory.id}`);
            if (nslResponse.ok) {
                const nslPosts = await nslResponse.json();
                console.log('NSL posts:', nslPosts.length);
                allPosts = [...allPosts, ...nslPosts].sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            } else {
                console.error('Failed to fetch NSL posts:', nslResponse.status);
            }
        }
        
        console.log('Total posts:', allPosts.length);
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