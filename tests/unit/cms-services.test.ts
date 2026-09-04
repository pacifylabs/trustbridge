import { describe, expect, it, vi, afterEach } from 'vitest';

/**
 * Service storage (lib/cms/services.ts).
 *
 * @upstash/redis is replaced with a small in-memory stand-in that implements
 * just enough of the sorted-set + JSON-document pattern this module relies
 * on (get/set/del/exists plus zadd/zrem/zrange/zcard for the ordering index),
 * so these never make a real network call. See cms-settings.test.ts for the
 * simpler single-document version of this same approach, and why
 * `unstable_cache` is mocked to a pass-through.
 */
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

class FakeRedis {
  private readonly docs = new Map<string, unknown>();
  private readonly sortedSets = new Map<string, Map<string, number>>();

  async get<T>(key: string): Promise<T | null> {
    return (this.docs.get(key) as T | undefined) ?? null;
  }

  async set(key: string, value: unknown): Promise<'OK'> {
    this.docs.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.docs.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.docs.has(key) ? 1 : 0;
  }

  async zadd(key: string, entry: { score: number; member: string }): Promise<number> {
    const set = this.sortedSets.get(key) ?? new Map<string, number>();
    const isNew = !set.has(entry.member);
    set.set(entry.member, entry.score);
    this.sortedSets.set(key, set);
    return isNew ? 1 : 0;
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.sortedSets.get(key)?.delete(member) ? 1 : 0;
  }

  async zcard(key: string): Promise<number> {
    return this.sortedSets.get(key)?.size ?? 0;
  }

  async zrange<T>(key: string): Promise<T> {
    const set = this.sortedSets.get(key) ?? new Map<string, number>();
    const members = [...set.entries()].sort((a, b) => a[1] - b[1]).map(([member]) => member);
    return members as T;
  }
}

function mockRedis() {
  vi.doMock('@upstash/redis', () => ({ Redis: FakeRedis }));
}

async function loadServices(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    KV_REST_API_URL: 'https://example.upstash.io',
    KV_REST_API_TOKEN: 'test-token',
    ...env,
  };
  return import('@/lib/cms/services');
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.doUnmock('@upstash/redis');
});

const INPUT = {
  slug: 'test-service',
  title: 'Test service',
  shortTitle: 'Test',
  category: 'work' as const,
  summary: 'A short summary for the test service.',
  icon: 'briefcase' as const,
  intro: 'Opening paragraph.',
  audience: 'Line one\nLine two',
  includes: 'Included thing',
  sections: [{ heading: 'A section', body: 'Paragraph one.\n\nParagraph two.' }],
  faqs: [{ question: 'A question?', answer: 'An answer.' }],
  order: 1,
  status: 'published' as const,
};

describe('createService / getServiceForAdmin', () => {
  it('splits multi-line fields into lists on write', async () => {
    mockRedis();
    const { createService, getServiceForAdmin } = await loadServices();

    await createService(INPUT);
    const stored = await getServiceForAdmin('test-service');

    expect(stored?.audience).toStrictEqual(['Line one', 'Line two']);
    expect(stored?.sections[0]?.body).toStrictEqual(['Paragraph one.', 'Paragraph two.']);
  });

  it('refuses to create a second service with the same address', async () => {
    mockRedis();
    const { createService } = await loadServices();

    await createService(INPUT);
    await expect(createService(INPUT)).rejects.toThrow(/already exists/i);
  });
});

describe('updateService', () => {
  it('moves the Redis key when the address changes', async () => {
    mockRedis();
    const { createService, updateService, getServiceForAdmin } = await loadServices();

    await createService(INPUT);
    await updateService('test-service', { ...INPUT, slug: 'renamed-service' });

    expect(await getServiceForAdmin('test-service')).toBeNull();
    expect(await getServiceForAdmin('renamed-service')).not.toBeNull();
  });

  it('throws for a service that does not exist', async () => {
    mockRedis();
    const { updateService } = await loadServices();

    await expect(updateService('missing', INPUT)).rejects.toThrow(/no service found/i);
  });
});

describe('deleteService', () => {
  it('removes the document so it no longer appears in admin listings', async () => {
    mockRedis();
    const { createService, deleteService, listAllServices } = await loadServices();

    await createService(INPUT);
    await deleteService('test-service');

    expect(await listAllServices()).toHaveLength(0);
  });
});

describe('listPublishedServices', () => {
  it('falls back to the bundled services, sorted, when Redis is unconfigured', async () => {
    mockRedis();
    const { listPublishedServices } = await loadServices({
      KV_REST_API_URL: undefined,
      KV_REST_API_TOKEN: undefined,
    });

    const services = await listPublishedServices();
    expect(services.length).toBeGreaterThan(0);
    const orders = services.map((service) => service.order);
    expect(orders).toStrictEqual([...orders].sort((a, b) => a - b));
  });

  it('excludes draft services once Redis is configured', async () => {
    mockRedis();
    const { createService, listPublishedServices } = await loadServices();

    await createService({ ...INPUT, status: 'draft' });
    expect(await listPublishedServices()).toHaveLength(0);
  });

  it('orders published services by their position field', async () => {
    mockRedis();
    const { createService, listPublishedServices } = await loadServices();

    await createService({ ...INPUT, slug: 'second', order: 2 });
    await createService({ ...INPUT, slug: 'first', order: 1 });

    const services = await listPublishedServices();
    expect(services.map((service) => service.slug)).toStrictEqual(['first', 'second']);
  });
});

describe('seedServicesIfEmpty', () => {
  it('loads the bundled services only when none exist yet', async () => {
    mockRedis();
    const { seedServicesIfEmpty, listAllServices } = await loadServices();

    const firstRun = await seedServicesIfEmpty();
    expect(firstRun).toBeGreaterThan(0);

    const secondRun = await seedServicesIfEmpty();
    expect(secondRun).toBe(0);
    expect(await listAllServices()).toHaveLength(firstRun);
  });

  it('never overwrites a service an editor has already created', async () => {
    mockRedis();
    const { createService, seedServicesIfEmpty, listAllServices } = await loadServices();

    await createService(INPUT);
    await seedServicesIfEmpty();

    const all = await listAllServices();
    expect(all.some((service) => service.slug === 'test-service')).toBe(true);
    expect(all).toHaveLength(1);
  });
});
