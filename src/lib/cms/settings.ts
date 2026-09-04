import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import { env } from '@/lib/env';

/**
 * Site settings, controlled from /cms/settings.
 *
 * A single JSON document rather than one Redis key per setting: there are
 * few of them, they are always read together, and a single document makes
 * "what does the site currently show" one lookup instead of four.
 *
 * Every default below matches the equivalent environment variable's default
 * (see lib/env.ts), so a deployment where Redis is unconfigured, unreachable,
 * or has never been written to behaves exactly as the old env-var-only
 * version did: closed. Settings only ever *open* things up beyond the
 * env-var defaults, never override them shut — see isSiteLaunched in flags.ts.
 *
 * `getSettings` is wrapped in `unstable_cache`: this is read from the root
 * layout on every page, and an uncached Redis call there forces the entire
 * site into dynamic (server-rendered-per-request) rendering instead of the
 * static generation it otherwise qualifies for — a real performance
 * regression, not a hypothetical one (it is what caused every route to
 * render as `ƒ` instead of `○`/`●` the first time this was wired up
 * uncached). Deliberately time-based (`revalidate: 30`) rather than
 * invalidated on demand: `revalidateTag` did not reliably bust this cache in
 * testing against Next 16's newest cache-components runtime, and a wrong
 * "this is instant" promise is worse than an honest ~30-second window. The
 * "Go live" toggle is the one setting that genuinely is instant — it is
 * checked by middleware.ts directly against Redis on every request,
 * deliberately never going through this cache at all.
 */
export interface CmsSettings {
  readonly siteLaunched: boolean;
  readonly resourcesDataSource: 'demo' | 'cms';
  readonly featureComplexMatters: boolean;
  readonly featureBusinessImmigration: boolean;
}

const SETTINGS_KEY = 'cms:settings';
const CACHE_TAG = 'cms-settings';

const DEFAULT_SETTINGS: CmsSettings = {
  siteLaunched: false,
  resourcesDataSource: 'demo',
  featureComplexMatters: false,
  featureBusinessImmigration: false,
};

async function readSettingsUncached(): Promise<CmsSettings> {
  if (!redis) return DEFAULT_SETTINGS;

  try {
    const stored = await redis.get<Partial<CmsSettings>>(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    // Fail closed: a Redis outage must never be read as "settings say open".
    return DEFAULT_SETTINGS;
  }
}

const readSettingsCached = unstable_cache(readSettingsUncached, ['cms-settings-v1'], {
  tags: [CACHE_TAG],
  revalidate: 30,
});

export async function getSettings(): Promise<CmsSettings> {
  return readSettingsCached();
}

export async function updateSettings(patch: Partial<CmsSettings>): Promise<CmsSettings> {
  if (!redis) {
    throw new Error('Settings are not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  const next = { ...(await readSettingsUncached()), ...patch };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

/**
 * True when the public site should read real articles from the CMS rather
 * than the bundled demo set. Either the /cms/settings toggle or the
 * RESOURCES_DATA_SOURCE env var can open this; Redis being unreachable or
 * unconfigured is read as "no", the same closed-by-default reasoning as
 * `isSiteLaunched` in flags.ts.
 */
export async function isResourcesLiveFromCms(): Promise<boolean> {
  if (!redis) return false;
  const settings = await getSettings();
  return settings.resourcesDataSource === 'cms' || env.RESOURCES_DATA_SOURCE === 'cms';
}
