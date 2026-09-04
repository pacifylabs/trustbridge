import { env } from './env';
import { getSettings } from './cms/settings';

/**
 * Feature flags and the launch gate.
 *
 * Compliance context (README rules 3 and 4):
 *   - The full site must not be publicly reachable until the client approves
 *     launch. Production serves the Coming Soon page until launched.
 *   - Complex Immigration Matters, and the route-specific parts of Business
 *     Immigration, stay hidden until regulatory authorisation is confirmed.
 *
 * All three are readable from /cms/settings (Redis-backed) as well as their
 * environment variables. Either can open the gate; neither can close one the
 * other opened, and Redis being unreachable is read as "unset" — so the
 * closed, env-var-only behaviour this replaced is still exactly what happens
 * when Redis is not configured.
 */

export type FeatureFlag = 'complexMatters' | 'businessImmigration';

export interface FlagContext {
  /** Set when a staging reviewer holds a valid preview cookie. */
  readonly previewEnabled?: boolean;
}

/**
 * Preview mode reveals gated sections so the client can review them before
 * approving. It is available on staging only: production must never expose
 * gated content, whatever cookie the visitor happens to hold.
 */
function previewAllowed(context?: FlagContext): boolean {
  if (!context?.previewEnabled) return false;
  return env.NEXT_PUBLIC_APP_ENV !== 'production';
}

export async function isFeatureEnabled(flag: FeatureFlag, context?: FlagContext): Promise<boolean> {
  const settings = await getSettings();
  const fromSettings =
    flag === 'complexMatters' ? settings.featureComplexMatters : settings.featureBusinessImmigration;
  const fromEnv = flag === 'complexMatters' ? env.FEATURE_COMPLEX_MATTERS : env.FEATURE_BUSINESS_IMMIGRATION;

  return fromSettings || fromEnv || previewAllowed(context);
}

/**
 * The launch gate. Development and staging always serve the full site;
 * staging is protected at the hosting layer instead.
 *
 * The edge middleware that actually rewrites to Coming Soon cannot import
 * this module (see middleware.ts for why) and re-implements this same
 * settings-or-env-var check directly against Redis's REST API instead. If
 * the logic here ever changes, that copy needs to change with it.
 */
export async function isSiteLaunched(): Promise<boolean> {
  if (env.NEXT_PUBLIC_APP_ENV !== 'production') return true;
  const settings = await getSettings();
  return settings.siteLaunched || env.SITE_LAUNCHED;
}

export async function shouldServeComingSoon(): Promise<boolean> {
  return !(await isSiteLaunched());
}

export const PREVIEW_COOKIE_NAME = 'tb_preview';
