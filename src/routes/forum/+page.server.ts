import type { PageServerLoad } from './$types';
import { getCategories, getThreads } from '$lib/server/forumService';

export const load: PageServerLoad = async ({ locals }) => {
	const categories = await getCategories();
	const allThreads = await getThreads();

	const recentThreads = allThreads
		.sort((a, b) => new Date(b.lastPostDate).getTime() - new Date(a.lastPostDate).getTime())
		.slice(0, 5);

	return {
		categories,
		recentThreads,
		user: locals.user ?? null
	};
};
