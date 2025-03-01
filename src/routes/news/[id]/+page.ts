interface PageLoadParams {
  params: { id: string };
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export const load = async ({ params, fetch }: PageLoadParams) => {
  try {
    const response = await fetch(`/api/news/${params.id}`);

    if (!response.ok) {
      throw new Error(`Failed to load article: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.article) {
      throw new Error('Article not found');
    }

    return {
      article: data.article,
      success: true
    };
  } catch (error) {
    console.error('Error loading article:', error);
    return {
      article: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load article'
    };
  }
};