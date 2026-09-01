import Image from 'next/image';
import Link from 'next/link';
import { Card, CardFooter, CardHeading } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, toIsoDate } from '@/lib/utils';
import type { Article } from '@/lib/content/types';

/**
 * Article card (design system §4).
 *
 * The thumbnail region is an abstract token-derived panel rather than stock
 * photography, so the card is complete without an image while leaving an
 * obvious slot for real artwork later.
 */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card as="li" interactive className="group overflow-hidden p-0 sm:p-0">
      {article.image ? (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-border-subtle">
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div
          className="bg-mist relative flex h-32 shrink-0 items-end overflow-hidden border-b border-border-subtle p-5"
          aria-hidden="true"
        >
          {/*
            Fallback for an article with no artwork: concentric arcs echoing
            the bridge in the wordmark, so the card is still complete.
          */}
          <span className="absolute -top-10 -right-10 h-36 w-36 rounded-full border border-accent/45" />
          <span className="absolute top-2 -right-20 h-36 w-36 rounded-full border border-accent/30" />
          <span className="absolute -top-4 -right-32 h-36 w-36 rounded-full border border-accent/20" />
          <span className="absolute right-5 bottom-5 h-px w-12 bg-accent/50" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">{article.category}</Badge>
          <time dateTime={toIsoDate(article.publishedAt)} className="text-xs text-muted">
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <CardHeading className="mt-4">
          <Link href={`/resources/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </CardHeading>

        <p className="mt-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>

        <CardFooter>
          <p className="text-xs text-muted">{article.readingMinutes} minute read</p>
        </CardFooter>
      </div>
    </Card>
  );
}

export function ArticleGrid({ articles }: { articles: readonly Article[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [&>li]:relative">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </ul>
  );
}
