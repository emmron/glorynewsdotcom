import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { getDatabase } from './mongodb';

export interface StoredUser {
	id: string;
	username: string;
	email: string;
	emailLower: string;
	passwordHash: string;
	salt: string;
	createdAt: string;
	updatedAt: string;
}

export interface PublicUser {
	id: string;
	username: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

async function getUsersCollection() {
	const db = await getDatabase();
	if (!db) {
		console.warn('Database not available for user operations');
		return null;
	}
	return db.collection<StoredUser>('users');
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
	const users = await getUsersCollection();
	if (!users) return undefined;

	const user = await users.findOne({ id });
	return user || undefined;
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
	const users = await getUsersCollection();
	if (!users) return undefined;

	const normalized = email.toLowerCase();
	const user = await users.findOne({ emailLower: normalized });
	return user || undefined;
}

export async function getUserByUsername(username: string): Promise<StoredUser | undefined> {
	const users = await getUsersCollection();
	if (!users) return undefined;

	const normalized = username.toLowerCase();
	const user = await users.findOne({ username: new RegExp(`^${normalized}$`, 'i') });
	return user || undefined;
}

function sanitizeUser(user: StoredUser): PublicUser {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

function hashPassword(password: string, salt?: string) {
	const effectiveSalt = salt ?? randomBytes(16).toString('hex');
	const hashBuffer = scryptSync(password, effectiveSalt, 64);
	return {
		hash: hashBuffer.toString('hex'),
		salt: effectiveSalt
	};
}

export async function createUser(params: { username: string; email: string; password: string }): Promise<PublicUser> {
	const { username, email, password } = params;
	const users = await getUsersCollection();

	if (!users) {
		throw new Error('Database not available. User registration is disabled.');
	}

	const normalizedEmail = email.toLowerCase();
	const normalizedUsername = username.toLowerCase();

	// Check if email already exists
	const existingEmail = await users.findOne({ emailLower: normalizedEmail });
	if (existingEmail) {
		throw new Error('Email already in use');
	}

	// Check if username already exists
	const existingUsername = await users.findOne({ username: new RegExp(`^${normalizedUsername}$`, 'i') });
	if (existingUsername) {
		throw new Error('Username already taken');
	}

	const now = new Date().toISOString();
	const { hash, salt } = hashPassword(password);

	const newUser: StoredUser = {
		id: randomUUID(),
		username,
		email: normalizedEmail,
		emailLower: normalizedEmail,
		passwordHash: hash,
		salt,
		createdAt: now,
		updatedAt: now
	};

	await users.insertOne(newUser);

	return sanitizeUser(newUser);
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
	try {
		const { hash } = hashPassword(password, user.salt);
		const providedBuffer = Buffer.from(hash, 'hex');
		const storedBuffer = Buffer.from(user.passwordHash, 'hex');

		if (providedBuffer.length !== storedBuffer.length) {
			return false;
		}

		return timingSafeEqual(providedBuffer, storedBuffer);
	} catch (error) {
		console.error('Failed to verify password', error);
		return false;
	}
}

export { sanitizeUser };
