import { promises as fs } from 'fs';
import * as path from 'path';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';

const USERS_PATH = path.resolve('static/data/users.json');

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

let ensureUsersFilePromise: Promise<void> | null = null;

async function ensureUsersFile(): Promise<void> {
	if (!ensureUsersFilePromise) {
		ensureUsersFilePromise = (async () => {
			try {
				await fs.access(USERS_PATH);
			} catch {
				await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
				await fs.writeFile(USERS_PATH, '[]', 'utf-8');
			}
		})();
	}

	return ensureUsersFilePromise;
}

async function readUsers(): Promise<StoredUser[]> {
	await ensureUsersFile();

	try {
		const fileContents = await fs.readFile(USERS_PATH, 'utf-8');
		if (!fileContents.trim()) {
			return [];
		}

		const parsed = JSON.parse(fileContents) as StoredUser[] | null;
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed;
	} catch (error) {
		console.error('Failed to read users file. Resetting to empty array.', error);
		await fs.writeFile(USERS_PATH, '[]', 'utf-8');
		return [];
	}
}

async function writeUsers(users: StoredUser[]): Promise<void> {
	await ensureUsersFile();
	await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
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

export async function getUserById(id: string): Promise<StoredUser | undefined> {
	const users = await readUsers();
	return users.find((user) => user.id === id);
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
	const users = await readUsers();
	const normalized = email.toLowerCase();
	return users.find((user) => user.emailLower === normalized);
}

export async function getUserByUsername(username: string): Promise<StoredUser | undefined> {
	const users = await readUsers();
	const normalized = username.toLowerCase();
	return users.find((user) => user.username.toLowerCase() === normalized);
}

export async function createUser(params: { username: string; email: string; password: string }): Promise<PublicUser> {
	const { username, email, password } = params;

	const users = await readUsers();

	const normalizedEmail = email.toLowerCase();
	const normalizedUsername = username.toLowerCase();

	if (users.some((user) => user.emailLower === normalizedEmail)) {
		throw new Error('Email already in use');
	}

	if (users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
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

	users.push(newUser);
	await writeUsers(users);

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

export { sanitizeUser, ensureUsersFile, readUsers as _readUsers, writeUsers as _writeUsers };
