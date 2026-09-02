import { CONTACT, SITE } from '@/content/site';
import type { Article, Service } from '@/lib/content/types';

/**
 * JSON-LD structured data.
 *
 * Three rules this file holds to, all of them consequences of the brief:
 *
 *  - No `aggregateRating` and no `Review`. The testimonials on the site are
 *    samples awaiting the practice's own, and marking up quotes that are not
 *    yet real client feedback would be fabricated review data. It also breaches
 *    Google's own policy.
 *  - Nothing implies an outcome. No `award`, no success claims.
 *  - No regulatory claim. `ProfessionalService` describes what the practice
 *    does, not what it is authorised to do, and no accreditation is asserted
 *    until the practice supplies the wording.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built here from typed content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Identity of the practice. Emitted once, from the site shell. */
export function OrganisationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${SITE.url}/#organisation`,
        name: SITE.name,
        alternateName: SITE.shortName,
        description: SITE.description,
        url: SITE.url,
        image: `${SITE.url}${SITE.ogImage.path}`,
        logo: `${SITE.url}/logo.png`,
        email: CONTACT.email,
        telephone: CONTACT.phone,
        areaServed: { '@type': 'Country', name: 'United Kingdom' },
        knowsLanguage: SITE.language,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Company number',
          value: SITE.companyNumber,
        },
      }}
    />
  );
}

/** The site itself, so a search engine can offer the name as a sitelink. */
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: SITE.language,
        publisher: { '@id': `${SITE.url}/#organisation` },
      }}
    />
  );
}

/** Trail for a page nested under one or more parents. */
export function BreadcrumbSchema({
  trail,
}: {
  trail: readonly { readonly name: string; readonly path: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((step, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: step.name,
          item: `${SITE.url}${step.path}`,
        })),
      }}
    />
  );
}

/**
 * A single service, plus its questions where it has them.
 *
 * The FAQ entries are the ones already visible on the page. Marking up
 * questions a visitor cannot see is against Google's guidelines, so this reads
 * from the same gated list the page renders.
 */
export function ServiceSchema({
  service,
  faqs,
}: {
  service: Pick<Service, 'slug' | 'title' | 'summary'>;
  faqs: readonly { readonly question: string; readonly answer: string }[];
}) {
  const url = `${SITE.url}/services/${service.slug}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.summary,
          url,
          serviceType: service.title,
          provider: { '@id': `${SITE.url}/#organisation` },
          areaServed: { '@type': 'Country', name: 'United Kingdom' },
        }}
      />

      {faqs.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      ) : null}
    </>
  );
}

/** A published article. */
export function ArticleSchema({ article }: { article: Article }) {
  const url = `${SITE.url}/resources/${article.slug}`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        inLanguage: SITE.language,
        author: { '@id': `${SITE.url}/#organisation` },
        publisher: { '@id': `${SITE.url}/#organisation` },
        image: [`${SITE.url}/og/${article.slug}.jpg`],
      }}
    />
  );
}
