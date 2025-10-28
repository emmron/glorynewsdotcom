import type { Handle } from '@sveltejs/kit';
import * as fs from 'fs';
import * as path from 'path';
import { ensureUsersFile } from '$lib/server/userStore';
import type { PublicUser } from '$lib/server/userStore';
import { SESSION_COOKIE_NAME, clearSessionCookieOptions, getUserFromSession } from '$lib/server/session';

// Create comments directory on startup
const COMMENTS_DIR = path.resolve('static/data/comments');
try {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true });
    console.log('Comments directory created at:', COMMENTS_DIR);
  }
} catch (error) {
  console.error('Failed to create comments directory:', error);
}

export const handle: Handle = async ({ event, resolve }) => {
  await ensureUsersFile();

  const locals = event.locals as typeof event.locals & { user?: PublicUser | null };
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  if (sessionCookie) {
    const user = await getUserFromSession(sessionCookie);

	if (user) {
		locals.user = user;
	} else {
		locals.user = undefined;
		event.cookies.set(SESSION_COOKIE_NAME, '', clearSessionCookieOptions);
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}
} else {
	locals.user = undefined;
}

  // Get response from endpoint
  const response = await resolve(event);

  // Add common security headers and SEO headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Optimize caching for static assets
  const url = event.url.pathname;
  if (url.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.includes('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=86400');
  }

  return response;
};
