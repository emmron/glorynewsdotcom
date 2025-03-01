interface PageLoadParams {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export const load = async ({ fetch }: PageLoadParams) => {
  try {
    const response = await fetch('/api/news');

    if (!response.ok) {
      throw new Error(`Failed to load news: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to load news data');
    }

    return {
      articles: data.articles || [],
      success: true,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error loading news:', error);
    return {
      articles: [],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load news',
      timestamp: new Date().toISOString()
    };
  }
};