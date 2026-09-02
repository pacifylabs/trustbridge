import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { buildMetadata } from '@/lib/seo';
import { ChevronRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { CtaBand } from '@/components/blocks/CtaBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { Badge } from '@/components/ui/Badge';
import { getArticleBySlug, getArticles } from '@/lib/content';
import { formatDate, toIsoDate } from '@/lib/utils';

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: 'Not found' };

  return buildMetadata({
    title: article.seo.title,
    description: article.seo.description,
    path: `/resources/${article.slug}`,
    type: 'article',
    publishedTime: toIsoDate(article.publishedAt),
    modifiedTime: toIsoDate(article.updatedAt ?? article.publishedAt),
    image: { src: `/og/${article.slug}.jpg`, alt: article.image?.alt ?? article.title },
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <>
      <ArticleSchema article={article} />
      <BreadcrumbSchema
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: article.title, path: `/resources/${article.slug}` },
        ]}
      />

      <nav aria-label="Breadcrumb" className="border-b border-border-subtle bg-canvas">
        <div className="container-site py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-accent-ink">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li>
              <Link href="/resources" className="transition-colors hover:text-accent-ink">
                Resources
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      <Section tone="canvas" size="sm">
        <article className="mx-auto max-w-3xl">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{article.category}</Badge>
              <time dateTime={toIsoDate(article.publishedAt)} className="text-sm text-muted">
                {formatDate(article.publishedAt)}
              </time>
              <span className="text-sm text-muted">{article.readingMinutes} minute read</span>
            </div>

            <h1 className="mt-5 text-[1.875rem] text-headline sm:text-[2rem] lg:text-h1">
              {article.title}
            </h1>
            <p className="mt-4 text-body-lg leading-relaxed text-muted">{article.excerpt}</p>
            <p className="mt-6 border-t border-border-subtle pt-6 text-sm text-muted">
              Written by {article.author}
            </p>
          </header>

          <div className="mt-10 space-y-5">
            {article.body.map((block, index) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={`${index}-${block.text.slice(0, 20)}`} className="pt-4 text-h2 text-strong">
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'list') {
                return (
                  <ul
                    key={`${index}-list`}
                    className="ml-1 space-y-2.5 border-l-2 border-accent/30 pl-5"
                  >
                    {block.items.map((item) => (
                      <li key={item} className="leading-relaxed text-body">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={`${index}-${block.text.slice(0, 20)}`}
                  className="leading-relaxed text-body"
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          <div className="mt-12">
            <DisclaimerBlock />
          </div>
        </article>
      </Section>

      <CtaBand />
    </>
  );
}
