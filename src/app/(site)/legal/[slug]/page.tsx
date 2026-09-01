import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { CtaBand } from '@/components/blocks/CtaBand';
import { getLegalPageBySlug, getLegalPages } from '@/lib/content';
import { LEGAL_NAV } from '@/content/site';

/**
 * Legal and regulatory pages.
 *
 * The structure is live so the footer links resolve and the information
 * architecture can be reviewed, but no page makes a regulatory claim. Each
 * section carries a visible notice that the wording is pending, which is
 * preferable to placeholder prose that could be mistaken for the real terms.
 */

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const pages = await getLegalPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) return { title: 'Not found' };

  return { title: page.title, description: page.summary };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border-subtle bg-canvas">
        <div className="container-site py-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-accent-ink">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li aria-current="page" className="font-medium text-strong">
              {page.title}
            </li>
          </ol>
        </div>
      </nav>

      <Section tone="canvas" size="sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h1 className="text-[1.875rem] text-headline sm:text-[2rem] lg:text-h1">{page.title}</h1>
            <p className="measure mt-4 text-body-lg leading-relaxed text-muted">{page.summary}</p>

            {page.awaitingFinalWording ? (
              <div
                className="mt-8 flex gap-4 rounded-xl border border-accent/40 bg-accent-soft p-5"
                data-testid="pending-wording-notice"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-strong">Wording to be supplied</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    This page is structurally complete but the text has not been finalised. The
                    practice will supply the wording before the site goes live. Nothing on this page
                    should be relied upon in the meantime.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-10 space-y-8">
              {page.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-h2 text-strong">{section.heading}</h2>
                  <p className="measure mt-3 leading-relaxed text-muted">{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <nav
              aria-label="Legal pages"
              className="rounded-xl border border-border-subtle bg-surface p-6 lg:sticky lg:top-28"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">
                Legal and regulatory
              </p>
              <ul className="mt-4 space-y-1">
                {LEGAL_NAV.map((item) => {
                  const isCurrent = item.href === `/legal/${page.slug}`;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={
                          isCurrent
                            ? 'block rounded-md bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-ink'
                            : 'block rounded-md px-3 py-2 text-sm text-body transition-colors hover:bg-surface-sunken hover:text-strong'
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </Section>

      <CtaBand
        lead="Questions about"
        emphasis="how we work?"
        body="If anything here is unclear, or you would like a copy of our terms once they are published, get in touch."
        primaryLabel="Contact TrustBridge"
        primaryHref="/contact"
        secondaryLabel="Book a consultation"
        secondaryHref="/book"
      />
    </>
  );
}
