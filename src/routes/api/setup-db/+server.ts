import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setupDatabaseIndexes } from '$lib/server/setupDatabase';

/**
 * Setup database indexes
 * Call this endpoint once after deployment to create indexes
 * Protected by AUTH_SECRET environment variable
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.AUTH_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${expectedAuth}`) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await setupDatabaseIndexes();

    if (success) {
      return json({
        success: true,
        message: 'Database indexes created successfully'
      });
    } else {
      return json({
        success: false,
        message: 'Failed to create database indexes'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Setup database error:', error);
    return json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};
