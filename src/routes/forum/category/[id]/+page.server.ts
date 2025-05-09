import type { PageServerLoad } from './$types';
import { getCategories, getThreadsByCategory } from '$lib/services/forumService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  const categories = getCategories();
  const category = categories.find(cat => cat.id === id);

  if (!category) {
    throw error(404, 'Category not found');
  }

  return {
    category,
    threads: getThreadsByCategory(id)
  };
};