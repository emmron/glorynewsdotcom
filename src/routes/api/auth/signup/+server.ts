import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { createUser } from '$lib/server/userStore';
import { createSessionCookie } from '$lib/server/session';

const signupSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, 'Username must be at least 3 characters long.')
		.max(20, 'Username must be at most 20 characters long.')
		.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores.'),
	email: z.string().trim().email('Please provide a valid email address.'),
	password: z.string().min(8, 'Password must be at least 8 characters long.').max(128, 'Password is too long.')
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);

	const parsed = signupSchema.safeParse(body);
	if (!parsed.success) {
		const issues = parsed.error.issues.map((issue) => issue.message);
		return json({ error: issues.join(' ') }, { status: 400 });
	}

	const { username, email, password } = parsed.data;

	try {
		const user = await createUser({
			username,
			email,
			password
		});

		const session = createSessionCookie(user.id);
		cookies.set(session.name, session.value, session.options);

		return json({ user }, { status: 201 });
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'Email already in use' || error.message === 'Username already taken') {
				return json({ error: error.message }, { status: 409 });
			}

			console.error('Signup failed', error);
			return json({ error: 'Unable to create account. Please try again later.' }, { status: 500 });
		}

		console.error('Signup failed with unknown error', error);
		return json({ error: 'Unable to create account. Please try again later.' }, { status: 500 });
	}
};
