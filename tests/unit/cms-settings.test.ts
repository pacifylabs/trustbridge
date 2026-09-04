import { describe, expect, it, vi, afterEach } from 'vitest';

/**
 * CMS settings (lib/cms/settings.ts).
 *
 * Redis is always mocked here — @upstash/redis is replaced with an in-memory
 * stand-in per test — so these never make a real network call, and Redis
 * failures can be simulated deterministically (the "fails closed" cases
 * matter as much as the happy path: a Redis outage must never be read as
 * "settings say open").
 *
 * `next/cache`'s `unstable_cache` needs the real Next.js server runtime
 * (an "incrementalCache" instance Vitest never provides), so it is mocked
 * to a plain pass-through — the module comment on getSettings explains why
 * it is there in the first place (avoiding forcing every public page into
 * dynamic rendering), which these tests are not exercising.
 */
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

function mockRedis(behaviour: { get?: () => unknown; set?: () => unknown; throwOnGet?: boolean }) {
  vi.doMock('@upstash/redis', () => ({
    Redis: class {
      async get() {
        if (behaviour.throwOnGet) throw new Error('Redis unreachable');
        return behaviour.get ? behaviour.get() : null;
      }
      async set(...args: unknown[]) {
        return behaviour.set ? behaviour.set() : args;
      }
    },
  }));
}

async function loadSettings(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    KV_REST_API_URL: 'https://example.upstash.io',
    KV_REST_API_TOKEN: 'test-token',
    ...env,
  };
  return import('@/lib/cms/settings');
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.doUnmock('@upstash/redis');
});

describe('getSettings', () => {
  it('returns the closed defaults when Redis is unconfigured', async () => {
    mockRedis({});
    const { getSettings } = await loadSettings({
      KV_REST_API_URL: undefined,
      KV_REST_API_TOKEN: undefined,
    });

    expect(await getSettings()).toEqual({
      siteLaunched: false,
      resourcesDataSource: 'demo',
      featureComplexMatters: false,
      featureBusinessImmigration: false,
    });
  });

  it('returns the closed defaults when nothing has been written yet', async () => {
    mockRedis({ get: () => null });
    const { getSettings } = await loadSettings();

    expect((await getSettings()).siteLaunched).toBe(false);
  });

  it('returns stored values, merged over the defaults', async () => {
    mockRedis({ get: () => ({ siteLaunched: true }) });
    const { getSettings } = await loadSettings();

    const settings = await getSettings();
    expect(settings.siteLaunched).toBe(true);
    // Untouched fields keep their default.
    expect(settings.resourcesDataSource).toBe('demo');
  });

  it('fails closed when Redis throws', async () => {
    mockRedis({ throwOnGet: true });
    const { getSettings } = await loadSettings();

    expect(await getSettings()).toEqual({
      siteLaunched: false,
      resourcesDataSource: 'demo',
      featureComplexMatters: false,
      featureBusinessImmigration: false,
    });
  });
});

describe('updateSettings', () => {
  it('throws when Redis is not configured, rather than silently doing nothing', async () => {
    mockRedis({});
    const { updateSettings } = await loadSettings({
      KV_REST_API_URL: undefined,
      KV_REST_API_TOKEN: undefined,
    });

    await expect(updateSettings({ siteLaunched: true })).rejects.toThrow(/not configured/i);
  });
});

describe('isResourcesLiveFromCms', () => {
  it('is false with no Redis and no env override', async () => {
    mockRedis({});
    const { isResourcesLiveFromCms } = await loadSettings({
      KV_REST_API_URL: undefined,
      KV_REST_API_TOKEN: undefined,
      RESOURCES_DATA_SOURCE: 'demo',
    });

    expect(await isResourcesLiveFromCms()).toBe(false);
  });

  it('is true when the Redis setting says cms', async () => {
    mockRedis({ get: () => ({ resourcesDataSource: 'cms' }) });
    const { isResourcesLiveFromCms } = await loadSettings();

    expect(await isResourcesLiveFromCms()).toBe(true);
  });

  it('is true when the env var says cms, even with no settings written', async () => {
    mockRedis({ get: () => null });
    const { isResourcesLiveFromCms } = await loadSettings({ RESOURCES_DATA_SOURCE: 'cms' });

    expect(await isResourcesLiveFromCms()).toBe(true);
  });

  it('fails closed (demo) when Redis throws, even if the env var says cms', async () => {
    mockRedis({ throwOnGet: true });
    const { isResourcesLiveFromCms } = await loadSettings({ RESOURCES_DATA_SOURCE: 'demo' });

    expect(await isResourcesLiveFromCms()).toBe(false);
  });
});
