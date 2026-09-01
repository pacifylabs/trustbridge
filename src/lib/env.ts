import { z } from 'zod';

/**
 * Typed environment configuration.
 *
 * Read once, here. Nothing else in the codebase touches `process.env`, so the
 * set of variables the site depends on is visible in a single file and every
 * consumer gets a validated, correctly typed value.
 */

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => (typeof value === 'boolean' ? value : value.trim().toLowerCase() === 'true'));

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://trustbridgeimmigration.co.uk'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  SITE_LAUNCHED: booleanFromString.default(false),

  FEATURE_COMPLEX_MATTERS: booleanFromString.default(false),
  FEATURE_BUSINESS_IMMIGRATION: booleanFromString.default(false),

  PREVIEW_SECRET: z.string().optional(),
  CONTENT_SOURCE: z.enum(['local', 'payload']).default('local'),

  DATABASE_URL: z.string().optional(),
  PAYLOAD_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function readEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    SITE_LAUNCHED: process.env.SITE_LAUNCHED,
    FEATURE_COMPLEX_MATTERS: process.env.FEATURE_COMPLEX_MATTERS,
    FEATURE_BUSINESS_IMMIGRATION: process.env.FEATURE_BUSINESS_IMMIGRATION,
    PREVIEW_SECRET: process.env.PREVIEW_SECRET,
    CONTENT_SOURCE: process.env.CONTENT_SOURCE,
    DATABASE_URL: process.env.DATABASE_URL,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  });

  if (!parsed.success) {
    // Fail loudly. A misread launch flag is the single most costly failure
    // this site can have, so an invalid environment must never boot silently.
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env: Env = readEnv();

/**
 * `CONTENT_SOURCE=payload` is meaningless without a database to read from,
 * so the two are validated together rather than independently.
 */
export function assertContentSourceConfigured(): void {
  if (env.CONTENT_SOURCE === 'payload' && !env.DATABASE_URL) {
    throw new Error('CONTENT_SOURCE is "payload" but DATABASE_URL is not set.');
  }
}
