import { describe, expect, it, vi, afterEach } from 'vitest';

/**
 * Content source and feature gating.
 *
 * The gating lives in the content layer rather than in each page, so these
 * tests are what guarantee a gated service cannot reach a navigation menu, a
 * services index or a sitemap.
 */

const ORIGINAL_ENV = { ...process.env };

async function loadContent(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, ...env };
  return import('@/lib/content');
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('service visibility', () => {
  it('excludes Complex Matters while the flag is off', async () => {
    const { getVisibleServices } = await loadContent({ FEATURE_COMPLEX_MATTERS: 'false' });
    const services = await getVisibleServices();

    expect(services.some((service) => service.slug === 'complex-immigration-matters')).toBe(false);
    expect(services).toHaveLength(8);
  });

  it('includes Complex Matters once the flag is on', async () => {
    const { getVisibleServices } = await loadContent({ FEATURE_COMPLEX_MATTERS: 'true' });
    const services = await getVisibleServices();

    expect(services.some((service) => service.slug === 'complex-immigration-matters')).toBe(true);
    expect(services).toHaveLength(9);
  });

  it('resolves a gated service to null so the route can return 404', async () => {
    const { getVisibleServiceBySlug } = await loadContent({ FEATURE_COMPLEX_MATTERS: 'false' });
    expect(await getVisibleServiceBySlug('complex-immigration-matters')).toBeNull();
  });

  it('returns null for a slug that does not exist', async () => {
    const { getVisibleServiceBySlug } = await loadContent();
    expect(await getVisibleServiceBySlug('not-a-real-service')).toBeNull();
  });

  it('returns services in display order', async () => {
    const { getVisibleServices } = await loadContent();
    const services = await getVisibleServices();
    const orders = services.map((service) => service.order);

    expect(orders).toStrictEqual([...orders].sort((a, b) => a - b));
  });
});

describe('business immigration section gating', () => {
  it('hides route-specific sections while the flag is off, keeping the page', async () => {
    const { getVisibleServiceBySlug, getVisibleSections } = await loadContent({
      FEATURE_BUSINESS_IMMIGRATION: 'false',
    });

    const service = await getVisibleServiceBySlug('business-immigration');
    expect(service).not.toBeNull();

    const sections = getVisibleSections(service!);
    expect(sections.some((section) => section.heading === 'Sponsor licence applications')).toBe(false);
    expect(sections.some((section) => section.heading === 'Sponsorship duties in practice')).toBe(true);
  });

  it('reveals route-specific sections once the flag is on', async () => {
    const { getVisibleServiceBySlug, getVisibleSections } = await loadContent({
      FEATURE_BUSINESS_IMMIGRATION: 'true',
    });

    const service = await getVisibleServiceBySlug('business-immigration');
    const sections = getVisibleSections(service!);

    expect(sections.some((section) => section.heading === 'Sponsor licence applications')).toBe(true);
  });
});

describe('articles', () => {
  it('returns published articles newest first', async () => {
    const { getArticles } = await loadContent();
    const articles = await getArticles();

    expect(articles.length).toBeGreaterThan(0);
    expect(articles.every((article) => article.status === 'published')).toBe(true);

    const dates = articles.map((article) => article.publishedAt);
    expect(dates).toStrictEqual([...dates].sort().reverse());
  });

  it('excludes sample articles in production', async () => {
    const { getArticles } = await loadContent({ NEXT_PUBLIC_APP_ENV: 'production' });
    const articles = await getArticles();

    expect(articles.every((article) => !article.isSample)).toBe(true);
  });

  it('does not resolve a sample article by slug in production', async () => {
    const { getArticleBySlug } = await loadContent({ NEXT_PUBLIC_APP_ENV: 'production' });
    expect(await getArticleBySlug('how-we-handle-your-documents')).toBeNull();
  });
});

describe('advisers', () => {
  it('ships no real adviser profiles until the client supplies them', async () => {
    const { ADVISERS } = await import('@/content/advisers');
    expect(ADVISERS).toHaveLength(0);
  });

  it('returns no advisers outside development, so seeds cannot leak', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    const { getAdvisers } = await loadContent({ NEXT_PUBLIC_APP_ENV: 'staging' });
    expect(await getAdvisers()).toHaveLength(0);

    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
  });
});

describe('legal pages', () => {
  it('publishes all six legal routes with wording still pending', async () => {
    const { getLegalPages } = await loadContent();
    const pages = await getLegalPages();

    expect(pages).toHaveLength(6);
    expect(pages.every((page) => page.awaitingFinalWording)).toBe(true);
  });
});

describe('stat figures', () => {
  it('reports the number of service areas actually published', async () => {
    const { getStats, getVisibleServices } = await loadContent({
      FEATURE_COMPLEX_MATTERS: 'false',
    });

    const stats = await getStats();
    const services = await getVisibleServices();
    const serviceAreas = stats.find((stat) => stat.label === 'Service areas');

    expect(serviceAreas?.value).toBe(String(services.length));
    expect(serviceAreas?.value).toBe('8');
  });

  it('follows the service count when a gated service is revealed', async () => {
    const { getStats, getVisibleServices } = await loadContent({
      FEATURE_COMPLEX_MATTERS: 'true',
    });

    const stats = await getStats();
    const services = await getVisibleServices();

    expect(stats.find((stat) => stat.label === 'Service areas')?.value).toBe(
      String(services.length),
    );
    expect(services).toHaveLength(9);
  });

  it('leaves placeholder figures untouched', async () => {
    const { getStats } = await loadContent();
    const stats = await getStats();

    for (const stat of stats.filter((item) => item.needsClientConfirmation)) {
      expect(stat.value).toBe('TBC');
    }
  });

  it('publishes no figure that could imply an outcome', async () => {
    const { getStats } = await loadContent();
    const stats = await getStats();

    for (const stat of stats) {
      expect(`${stat.value} ${stat.label} ${stat.detail}`).not.toMatch(
        /success|approval|guarantee|win|refusal rate/i,
      );
    }
  });
});
