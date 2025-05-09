import type { PageServerLoad } from './$types';
import { getCategories, getThreads } from '$lib/services/forumService';

export const load: PageServerLoad = async () => {
  return {
    categories: getCategories(),
    recentThreads: getThreads().sort((a, b) =>
      new Date(b.lastPostDate).getTime() - new Date(a.lastPostDate).getTime()
    ).slice(0, 5)
  };
};