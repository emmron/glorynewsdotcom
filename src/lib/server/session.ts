import { createHmac, timingSafeEqual } from 'crypto';
import type { PublicUser } from './userStore';
import { getUserById, sanitizeUser } from './userStore';

const SESSION_SECRET = process.env.AUTH_SECRET ?? 'development-secret';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const SESSION_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: SESSION_MAX_AGE
};

function sign(value: string): string {
	return createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function encodeSession(userId: string): string {
	const issuedAt = Date.now().toString();
	const payload = `${userId}.${issuedAt}`;
	const signature = sign(payload);
	return `${payload}.${signature}`;
}

export function decodeSession(sessionValue: string): { userId: string; issuedAt: number } | null {
	const parts = sessionValue.split('.');
	if (parts.length !== 3) {
		return null;
	}

	const [userId, issuedAtRaw, providedSignature] = parts;
	if (!userId || !issuedAtRaw || !providedSignature) {
		return null;
	}

	const payload = `${userId}.${issuedAtRaw}`;
	const expectedSignature = sign(payload);

	try {
		const providedBuffer = Buffer.from(providedSignature, 'hex');
		const expectedBuffer = Buffer.from(expectedSignature, 'hex');

		if (providedBuffer.length !== expectedBuffer.length) {
			return null;
		}

		if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
			return null;
		}
	} catch (error) {
		console.error('Failed to validate session signature', error);
		return null;
	}

	const issuedAt = Number.parseInt(issuedAtRaw, 10);
	if (Number.isNaN(issuedAt)) {
		return null;
	}

	return { userId, issuedAt };
}

export function createSessionCookieValue(userId: string): string {
	return encodeSession(userId);
}

export async function getUserFromSession(sessionValue: string | undefined | null): Promise<PublicUser | null> {
	if (!sessionValue) {
		return null;
	}

	const decoded = decodeSession(sessionValue);
	if (!decoded) {
		return null;
	}

	const user = await getUserById(decoded.userId);
	if (!user) {
		return null;
	}

	return sanitizeUser(user);
}

export function createSessionCookie(userId: string) {
	return {
		name: SESSION_COOKIE_NAME,
		value: createSessionCookieValue(userId),
		options: SESSION_COOKIE_OPTIONS
	};
}

export const clearSessionCookieOptions = {
	...SESSION_COOKIE_OPTIONS,
	maxAge: 0
};
