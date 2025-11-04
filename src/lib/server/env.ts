/**
 * Environment variable validation and configuration
 */

interface EnvironmentConfig {
  mongodb: {
    uri: string | null;
    isConfigured: boolean;
  };
  redis: {
    url: string | null;
    token: string | null;
    isConfigured: boolean;
  };
  auth: {
    secret: string;
  };
  mode: 'development' | 'production';
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const mongoUri = process.env.MONGODB_URI || null;
  const redisUrl = process.env.UPSTASH_REDIS_URL || null;
  const redisToken = process.env.UPSTASH_REDIS_TOKEN || null;
  const authSecret = process.env.AUTH_SECRET || 'development-secret';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    mongodb: {
      uri: mongoUri,
      isConfigured: mongoUri !== null && mongoUri.length > 0
    },
    redis: {
      url: redisUrl,
      token: redisToken,
      isConfigured: redisUrl !== null && redisToken !== null
    },
    auth: {
      secret: authSecret
    },
    mode: nodeEnv === 'production' ? 'production' : 'development'
  };
}

export function validateEnvironment(): { isValid: boolean; warnings: string[] } {
  const config = getEnvironmentConfig();
  const warnings: string[] = [];

  if (!config.mongodb.isConfigured) {
    warnings.push('MONGODB_URI is not configured. User auth, comments, and forum features will be disabled.');
  }

  if (!config.redis.isConfigured) {
    warnings.push('Redis is not configured. Using in-memory cache (will not persist across deployments).');
  }

  if (config.mode === 'production' && config.auth.secret === 'development-secret') {
    warnings.push('WARNING: Using default AUTH_SECRET in production. This is insecure!');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('Environment Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  return {
    isValid: true,  // App can run without MongoDB, just with reduced features
    warnings
  };
}

// Validate on module load
validateEnvironment();
