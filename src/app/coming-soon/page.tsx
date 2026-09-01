import type { Metadata } from 'next';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { FloatingThemeToggle } from '@/components/layout/FloatingThemeToggle';
import { CONTACT, SITE } from '@/content/site';
import { COMING_SOON } from '@/content/pages';

/**
 * Coming Soon page.
 *
 * What production serves until the client approves launch. It carries the two
 * contact lines and nothing else: no service list, no regulatory statement and
 * no claim about what the practice can achieve.
 */
export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-mist absolute inset-0" />
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-soft blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-accent-soft blur-3xl" />
      </div>

      <header className="container-site pt-10">
        <Image
          src="/logo.png"
          alt={SITE.name}
          width={2172}
          height={724}
          priority
          className="site-logo h-12 w-auto sm:h-16"
        />
      </header>

      <main className="container-site flex flex-1 items-center py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold tracking-[0.14em] text-accent-ink uppercase">
            Website in preparation
          </p>

          <TwoToneHeading
            as="h1"
            size="display"
            lead={COMING_SOON.lead}
            emphasis={COMING_SOON.emphasis}
          />

          <p className="measure mt-6 text-body-lg leading-relaxed text-muted">
            {COMING_SOON.standfirst}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex min-h-12 items-center gap-3 rounded-md bg-accent px-6 font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="inline-flex min-h-12 items-center gap-3 rounded-md border border-border-strong px-6 font-semibold text-strong transition-colors hover:border-accent hover:text-accent-ink"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </main>

      <footer className="container-site pb-10">
        <p className="border-t border-border-subtle pt-6 text-sm text-muted">
          &copy; {new Date().getFullYear()} {SITE.name}. Registered in {SITE.incorporatedIn}, company
          number {SITE.companyNumber}.
        </p>
      </footer>
      <FloatingThemeToggle />
    </div>
  );
}
