import { env } from './env';

/**
 * Feature flags and the launch gate.
 *
 * Compliance context (README rules 3 and 4):
 *   - The full site must not be publicly reachable until the client approves
 *     launch. Production serves the Coming Soon page until `SITE_LAUNCHED`.
 *   - Complex Immigration Matters, and the route-specific parts of Business
 *     Immigration, stay hidden until regulatory authorisation is confirmed.
 *
 * Both default to the closed position. A missing or malformed variable
 * therefore hides content rather than exposing it.
 */

export type FeatureFlag = 'complexMatters' | 'businessImmigration';

export interface FlagContext {
  /** Set when a staging reviewer holds a valid preview cookie. */
  readonly previewEnabled?: boolean;
}

const flagValues: Record<FeatureFlag, boolean> = {
  complexMatters: env.FEATURE_COMPLEX_MATTERS,
  businessImmigration: env.FEATURE_BUSINESS_IMMIGRATION,
};

/**
 * Preview mode reveals gated sections so the client can review them before
 * approving. It is available on staging only: production must never expose
 * gated content, whatever cookie the visitor happens to hold.
 */
function previewAllowed(context?: FlagContext): boolean {
  if (!context?.previewEnabled) return false;
  return env.NEXT_PUBLIC_APP_ENV !== 'production';
}

export function isFeatureEnabled(flag: FeatureFlag, context?: FlagContext): boolean {
  return flagValues[flag] || previewAllowed(context);
}

/**
 * The launch gate. Development and staging always serve the full site;
 * staging is protected at the hosting layer instead.
 */
export function isSiteLaunched(): boolean {
  if (env.NEXT_PUBLIC_APP_ENV !== 'production') return true;
  return env.SITE_LAUNCHED;
}

export function shouldServeComingSoon(): boolean {
  return !isSiteLaunched();
}

export const PREVIEW_COOKIE_NAME = 'tb_preview';
