import { Redis } from '@upstash/redis';
import { env, isCmsConfigured } from '@/lib/env';

/**
 * Upstash Redis client for the Resources CMS.
 *
 * `null` when unconfigured, rather than throwing, so the rest of the app can
 * fall back to the bundled sample articles instead of failing to build or
 * serving a broken page before the client has provisioned a database.
 */
export const redis: Redis | null = isCmsConfigured()
  ? new Redis({ url: env.KV_REST_API_URL!, token: env.KV_REST_API_TOKEN! })
  : null;
