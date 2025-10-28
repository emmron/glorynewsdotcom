import type { PageServerLoad } from './$types';
import { getThread, getRepliesByThread, incrementThreadViews } from '$lib/services/forumService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const threadId = parseInt(params.id, 10);

	if (Number.isNaN(threadId)) {
		throw error(400, 'Invalid thread ID');
	}

	const thread = getThread(threadId);

	if (!thread) {
		throw error(404, 'Thread not found');
	}

	// Increment view count (normally would be done in an action)
	incrementThreadViews(threadId);

	return {
		thread,
		replies: getRepliesByThread(threadId),
		user: locals.user ?? null
	};
};
