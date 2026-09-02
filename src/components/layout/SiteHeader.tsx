'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { CTA_LABELS, CONTACT, PRIMARY_NAV, SITE } from '@/content/site';
import { cn } from '@/lib/utils';

export interface HeaderService {
  readonly slug: string;
  readonly shortTitle: string;
  readonly summary: string;
}

/**
 * Sticky top navigation (design system §4).
 *
 * The services dropdown is a two-column list rather than a mega menu: eight
 * items do not justify the additional complexity. It opens on click, closes on
 * Escape and on outside click, and collapses into the mobile panel below the
 * medium breakpoint.
 */
export function SiteHeader({ services }: { services: readonly HeaderService[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const servicesMenuId = useId();

  // Route changes must close both panels, or the menu lingers over the new
  // page. Adjusting during render rather than in an effect means the new page
  // never paints with the old menu open.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setMobileOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    if (!servicesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setServicesOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [servicesOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-canvas/90 backdrop-blur-md">
      <div className="container-site">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label={`${SITE.shortName} home`}
          >
            <Image
              src="/logo.png"
              alt={SITE.name}
              width={2172}
              height={724}
              priority
              className="site-logo h-10 w-auto sm:h-11 lg:h-14"
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                if (item.href !== '/services') {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={cn(
                          'inline-flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150',
                          isActive(item.href)
                            ? 'text-accent-ink'
                            : 'text-body hover:bg-surface-sunken hover:text-strong',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.href} ref={servicesRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setServicesOpen((open) => !open)}
                      aria-expanded={servicesOpen}
                      aria-controls={servicesMenuId}
                      className={cn(
                        'inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors duration-150',
                        isActive(item.href)
                          ? 'text-accent-ink'
                          : 'text-body hover:bg-surface-sunken hover:text-strong',
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          servicesOpen && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {servicesOpen ? (
                      <div
                        id={servicesMenuId}
                        className="absolute top-full left-1/2 z-50 mt-2 w-[38rem] -translate-x-1/2 rounded-xl border border-border-subtle bg-surface p-3 shadow-lg"
                      >
                        <ul className="grid grid-cols-2 gap-1">
                          {services.map((service) => (
                            <li key={service.slug}>
                              <Link
                                href={`/services/${service.slug}`}
                                className="block h-full rounded-lg p-3 transition-colors duration-150 hover:bg-surface-sunken"
                              >
                                <span className="block text-sm font-semibold text-strong">
                                  {service.shortTitle}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted">
                                  {service.summary}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-1 border-t border-border-subtle pt-3">
                          <Link
                            href="/services"
                            className="block rounded-lg px-3 py-2 text-sm font-semibold text-accent-ink hover:bg-surface-sunken"
                          >
                            View all services
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/*
              The telephone number sits next to the booking button because it is
              what someone anxious about their status reaches for first. It is
              hidden below `xl` rather than wrapped: the bar already carries the
              button and the theme control, and three items crowd at that width.
            */}
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-strong transition-colors hover:text-accent-ink xl:inline-flex"
            >
              <Phone className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <span className="sr-only">Telephone </span>
              {CONTACT.phone}
            </a>

            <Button href="/book" variant="accent" size="sm" className="hidden lg:inline-flex">
              {CTA_LABELS.book}
            </Button>

            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle text-strong lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
              <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-border-subtle bg-canvas lg:hidden"
        >
          <nav aria-label="Primary mobile" className="container-site py-4">
            <ul className="flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-md px-3 text-base font-medium',
                      isActive(item.href) ? 'bg-accent-soft text-accent-ink' : 'text-body',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="px-3 pb-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                Services
              </p>
              <ul className="flex flex-col gap-0.5">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="flex min-h-11 items-center rounded-md px-3 text-sm text-body"
                    >
                      {service.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-5">
              <Button href="/book" variant="accent" block>
                {CTA_LABELS.book}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
