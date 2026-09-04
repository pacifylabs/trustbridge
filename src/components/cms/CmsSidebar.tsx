'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, Phone, Scale, Settings, Star, Users } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { cn } from '@/lib/utils';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: typeof FileText;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Articles', href: '/cms/articles', icon: FileText },
  { label: 'Services', href: '/cms/services', icon: Briefcase },
  { label: 'Team', href: '/cms/team', icon: Users },
  { label: 'Testimonials', href: '/cms/testimonials', icon: Star },
  { label: 'Legal pages', href: '/cms/legal', icon: Scale },
  { label: 'Contact details', href: '/cms/contact', icon: Phone },
  { label: 'Settings', href: '/cms/settings', icon: Settings },
];

/** The CMS's own navigation, separate from the public site's SiteHeader. */
export function CmsSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-full w-full flex-col border-border-subtle bg-surface lg:w-64 lg:shrink-0 lg:border-r">
      <div className="border-b border-border-subtle px-4 py-4 lg:px-5">
        <Link href="/cms/articles" className="text-small font-semibold text-strong">
          TrustBridge CMS
        </Link>
      </div>

      <nav className="flex-1 overflow-x-auto px-2 py-3 lg:overflow-visible">
        <ul className="flex gap-1 lg:flex-col">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-small font-medium transition-colors',
                    active
                      ? 'bg-accent-soft text-accent-ink'
                      : 'text-muted hover:bg-surface-sunken hover:text-strong',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3 lg:px-5">
        <Link href="/resources" className="text-small text-muted hover:text-accent-ink" target="_blank">
          View site
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
