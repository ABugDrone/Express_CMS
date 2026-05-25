import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable validation schema using Zod
 * This ensures type safety and validates all required variables at startup
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('8000'),
  APP_URL: z.string().url().default('http://localhost:8000'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication & Security
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  STAFF_PASSWORD: z.string().min(8, 'STAFF_PASSWORD must be at least 8 characters'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // Optional S3 Storage Configuration
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().default('jm-news'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Optional WebSocket Configuration
  WS_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  WS_ENABLED: z.string().transform(val => val === 'true').default('false'),
});

/**
 * Validates and parses environment variables
 * Throws detailed error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(
        `❌ Environment variable validation failed:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set correctly.`
      );
    }
    throw error;
  }
}

/**
 * Validated and typed environment configuration
 * Access environment variables through this object instead of process.env
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
