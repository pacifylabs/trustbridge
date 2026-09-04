import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { SITE } from '@/content/site';
import { COMING_SOON, HOME } from '@/content/pages';
import { getContact } from '@/lib/content';

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  robots: { index: false, follow: false },
};

/**
 * Holding page.
 *
 * Shown in place of the whole site while the launch gate is closed, so it is
 * deliberately one screen: everything a visitor needs is above the fold and
 * there is nothing to scroll for. `100svh` rather than `100vh` so the mobile
 * browser chrome cannot push the contact details out of view.
 *
 * It is a self-contained page, not the site shell. There is no navigation,
 * because every route it could link to is behind the same gate.
 */
export default async function ComingSoonPage() {
  const [backdrop] = HOME.heroBackdrop;
  const contact = await getContact();

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-navy-950">
      {backdrop ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            src={backdrop.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/*
            Firmer than the hero's, because this page has no panel behind its
            copy, but light enough that the photograph still reads. Weighted to
            the left, where the headline sits.
          */}
          <div className="absolute inset-0 bg-navy-950/62" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/35" />
        </div>
      ) : null}

      <header className="container-site flex shrink-0 items-center justify-between gap-4 pt-6 sm:pt-8">
        <Image
          src="/logo-horizontal.png"
          alt={SITE.name}
          width={1001}
          height={240}
          priority
          className="site-logo-inverse h-9 w-auto sm:h-10"
        />
        <ThemeToggle className="border-white/20 bg-white/10 text-on-photo hover:border-accent" />
      </header>

      <main className="container-site flex flex-1 items-center py-10">
        <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="mb-4 flex items-center gap-2.5 text-sm font-semibold tracking-[0.14em] text-accent uppercase">
              <span className="inline-block h-px w-6 bg-accent" aria-hidden="true" />
              {COMING_SOON.eyebrow}
            </p>

            <TwoToneHeading
              as="h1"
              size="display"
              tone="onPhoto"
              lead={COMING_SOON.lead}
              emphasis={COMING_SOON.emphasis}
            />

            <p className="measure mt-5 text-body-lg leading-relaxed text-on-photo-muted">
              {COMING_SOON.standfirst}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {COMING_SOON.routes.map((route) => (
                <li
                  key={route}
                  className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-on-photo backdrop-blur-sm"
                >
                  {route}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-xl sm:p-8">
              <h2 className="font-serif text-h3 text-on-photo">Speak to us in the meantime</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-photo-muted">
                The site is not open yet, but the practice is. Email or call and we will come back
                to you.
              </p>

              <ul className="mt-6 space-y-3">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="group flex min-h-12 items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-on-photo transition-colors hover:border-accent"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0 flex-1 break-words">{contact.email}</span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="group flex min-h-12 items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-on-photo transition-colors hover:border-accent"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{contact.phone}</span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="container-site shrink-0 border-t border-white/10 py-5">
        <p className="text-xs text-on-photo-muted">
          © {new Date().getFullYear()} {SITE.name}. Registered in {SITE.incorporatedIn}, company
          number {SITE.companyNumber}.
        </p>
      </footer>
    </div>
  );
}
