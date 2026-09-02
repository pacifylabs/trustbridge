import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Newspaper } from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Section } from '@/components/layout/Section';
import { ArticleGrid } from '@/components/blocks/ArticleCard';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getArticles } from '@/lib/content';
import { RESOURCES_PAGE } from '@/content/pages';
import { CTA_LABELS } from '@/content/site';

export const metadata: Metadata = buildMetadata({
  title: 'Resources',
  description:
    'Notes and updates from TrustBridge Immigration Services Ltd on how the immigration process works and what to expect.',
  path: '/resources',
});

export default async function ResourcesPage() {
  const articles = await getArticles();
  const categories = [...new Set(articles.map((article) => article.category))];

  return (
    <>
      <Hero
        eyebrow={RESOURCES_PAGE.hero.eyebrow}
        lead={RESOURCES_PAGE.hero.lead}
        emphasis={RESOURCES_PAGE.hero.emphasis}
        standfirst={RESOURCES_PAGE.hero.standfirst}
      />

      <Section tone="surface">
        {articles.length > 0 ? (
          <>
            {categories.length > 1 ? (
              <div className="mb-8 flex flex-wrap gap-2" aria-label="Article categories">
                {categories.map((category) => (
                  <Badge key={category} tone="neutral">
                    {category}
                  </Badge>
                ))}
              </div>
            ) : null}
            <ArticleGrid articles={articles} />
          </>
        ) : (
          <div
            className="mx-auto flex max-w-2xl flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface-sunken px-6 py-14 text-center"
            data-testid="resources-empty-state"
          >
            <span
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink"
              aria-hidden="true"
            >
              <Newspaper className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h2 className="text-h3 text-strong">{RESOURCES_PAGE.emptyState.heading}</h2>
            <p className="mt-3 text-small leading-relaxed text-muted">
              {RESOURCES_PAGE.emptyState.body}
            </p>
            <Button href="/contact" variant="secondary" className="mt-7">
              {CTA_LABELS.contact}
            </Button>
          </div>
        )}
      </Section>

      <CtaBand
        lead="Have a question about"
        emphasis="your own case?"
        body="Articles cover general ground. Advice on your circumstances needs a proper look at your history and documents."
      />
    </>
  );
}
