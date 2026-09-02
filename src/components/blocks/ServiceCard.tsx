import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  FileText,
  Globe,
  Home,
  Plane,
  Scale,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardFooter } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Service, ServiceIcon } from '@/lib/content/types';

const ICONS: Record<ServiceIcon, LucideIcon> = {
  users: Users,
  plane: Plane,
  briefcase: Briefcase,
  building: Building2,
  home: Home,
  award: Award,
  globe: Globe,
  'file-text': FileText,
  scale: Scale,
};

/**
 * Service card (design system §4).
 *
 * Every card is the same shell with the same padding and radius. The summary
 * grows and the link is pushed to the bottom by CardFooter, so a row of cards
 * stays level whatever the length of the text inside them.
 */
export function ServiceCard({
  service,
  featured = false,
}: {
  service: Pick<Service, 'slug' | 'shortTitle' | 'summary' | 'icon' | 'image'>;
  featured?: boolean;
}) {
  const Icon = ICONS[service.icon];

  return (
    <Card
      as="li"
      interactive
      className={cn(
        // `isolate` gives the card its own stacking context, so the featured
        // card's decoration can sit behind its content without any descendant
        // needing `relative`. That matters: a positioned descendant would
        // capture the heading link's overlay and shrink the clickable area
        // from the whole card down to the heading alone.
        'group isolate overflow-hidden p-0 sm:p-0',
        featured && 'sm:col-span-2',
      )}
    >
      {/*
        The photograph sits above the icon rather than replacing it: the icon
        is what distinguishes the routes at a glance once a visitor is
        scanning, and it stays legible where a photograph does not.

        The media has a fixed height, not an aspect ratio. The featured card is
        twice as wide as its neighbours, so a shared ratio would make its image
        proportionally taller and the row would no longer line up.
      */}
      {service.image ? (
        <div className="relative h-52 w-full shrink-0 overflow-hidden border-b border-border-subtle sm:h-56 lg:h-60">
          <Image
            src={service.image.src}
            alt={service.image.alt}
            fill
            sizes={
              featured
                ? '(min-width: 1024px) 44vw, (min-width: 640px) 92vw, 92vw'
                : '(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw'
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent"
          />
          <span
            className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface/90 text-accent-ink backdrop-blur-sm"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
      ) : null}

      {featured && !service.image ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-mist absolute inset-0 opacity-70" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 sm:p-7">

        {!service.image ? (
          <span
            className={cn(
              'mb-5 inline-flex items-center justify-center rounded-lg bg-accent-soft text-accent-ink',
              featured ? 'h-13 w-13' : 'h-11 w-11',
            )}
            aria-hidden="true"
          >
            <Icon className={featured ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={1.75} />
          </span>
        ) : null}

        <h3 className="text-h2 text-strong">
          {/*
            The overlay is lifted above the media, which is positioned so the
            photograph can fill it. Without this the card was clickable over
            its text but not over its image.
          */}
          <Link
            href={`/services/${service.slug}`}
            className="after:absolute after:inset-0 after:z-10"
          >
            {service.shortTitle}
          </Link>
        </h3>

        <p className="mt-3 text-body-lg leading-relaxed text-muted">
          {service.summary}
        </p>

        <CardFooter>
          <span className="inline-flex items-center gap-1.5 text-small font-semibold text-accent-ink">
            Learn more
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </CardFooter>
      </div>
    </Card>
  );
}

/** Grid wrapper. `relative` on the list item is what makes the card link fill the card. */
export function ServiceGrid({
  services,
  featureFirst = false,
}: {
  services: readonly Service[];
  /** Gives the first card a double-width treatment, breaking the even grid. */
  featureFirst?: boolean;
}) {
  return (
    <ul
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [&>li]:relative"
      data-testid="service-grid"
    >
      {services.map((service, index) => (
        <ServiceCard
          key={service.slug}
          service={service}
          featured={featureFirst && index === 0}
        />
      ))}
    </ul>
  );
}
