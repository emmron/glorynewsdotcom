import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { createSessionCookie } from '$lib/server/session';
import { getUserByEmail, getUserByUsername, sanitizeUser, verifyPassword } from '$lib/server/userStore';

const loginSchema = z.object({
	identifier: z.string().trim().min(1, 'Please provide your email or username.'),
	password: z.string().min(8, 'Password must be at least 8 characters long.').max(128, 'Password is too long.')
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);

	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		const issues = parsed.error.issues.map((issue) => issue.message);
		return json({ error: issues.join(' ') }, { status: 400 });
	}

	const { identifier, password } = parsed.data;
	const normalizedIdentifier = identifier.trim();

	const byEmail = await getUserByEmail(normalizedIdentifier.toLowerCase());
	const userRecord = byEmail ?? (await getUserByUsername(normalizedIdentifier));

	if (!userRecord) {
		return json({ error: 'Invalid credentials. Please check your details and try again.' }, { status: 401 });
	}

	const isValid = await verifyPassword(userRecord, password);
	if (!isValid) {
		return json({ error: 'Invalid credentials. Please check your details and try again.' }, { status: 401 });
	}

	const user = sanitizeUser(userRecord);
	const session = createSessionCookie(user.id);
	cookies.set(session.name, session.value, session.options);

	return json({ user });
};
