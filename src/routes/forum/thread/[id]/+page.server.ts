import type { PageServerLoad } from './$types';
import { getThread, getRepliesByThread, incrementThreadViews } from '$lib/server/forumService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const threadId = parseInt(params.id, 10);

	if (Number.isNaN(threadId)) {
		throw error(400, 'Invalid thread ID');
	}

	const thread = await getThread(threadId);

	if (!thread) {
		throw error(404, 'Thread not found');
	}

	// Increment view count
	await incrementThreadViews(threadId);

	const replies = await getRepliesByThread(threadId);

	return {
		thread,
		replies,
		user: locals.user ?? null
	};
};
