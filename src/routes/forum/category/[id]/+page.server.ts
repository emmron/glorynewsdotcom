import type { PageServerLoad } from './$types';
import { getCategories, getThreadsByCategory } from '$lib/server/forumService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const categories = await getCategories();
	const category = categories.find((cat) => cat.id === id);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const threads = await getThreadsByCategory(id);

	return {
		category,
		threads,
		user: locals.user ?? null
	};
};
