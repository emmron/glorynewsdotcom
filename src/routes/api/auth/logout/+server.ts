import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME, clearSessionCookieOptions } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.set(SESSION_COOKIE_NAME, '', clearSessionCookieOptions);
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

	return json({ success: true });
};
