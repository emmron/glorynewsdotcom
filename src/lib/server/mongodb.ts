import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB with connection pooling
 * Reuses existing connection in serverless environments
 */
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not configured. Database features will be disabled.');
    return { client: null, db: null };
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    console.log('Successfully connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return { client: null, db: null };
  }
}

/**
 * Get database instance (connects if needed)
 */
export async function getDatabase(): Promise<Db | null> {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Check if MongoDB is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const db = await getDatabase();
  return db !== null;
}
