interface PageLoadParams {
  params: { id: string };
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export const load = async ({ params, fetch }: PageLoadParams) => {
  try {
    // Fetch article and comments in parallel
    const [articleResponse, commentsResponse] = await Promise.all([
      fetch(`/api/news/${params.id}`),
      fetch(`/api/comments/${params.id}`)
    ]);

    if (!articleResponse.ok) {
      throw new Error(`Failed to load article: ${articleResponse.statusText}`);
    }

    const articleData = await articleResponse.json();

    if (!articleData.success || !articleData.article) {
      throw new Error('Article not found');
    }

    // Handle comments
    let comments = [];
    if (commentsResponse.ok) {
      comments = await commentsResponse.json();
    }

    return {
      article: articleData.article,
      comments,
      success: true
    };
  } catch (error) {
    console.error('Error loading article:', error);
    return {
      article: null,
      comments: [],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load article'
    };
  }
};