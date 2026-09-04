import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasAdminSession } from '@/lib/cms/auth';
import { CmsSidebar } from '@/components/cms/CmsSidebar';
import { ConfirmProvider } from '@/components/cms/ConfirmDialog';

export const metadata: Metadata = {
  title: { default: 'CMS', template: '%s | TrustBridge CMS' },
  robots: { index: false, follow: false },
};

/**
 * Everything under `/cms` except `/cms/login` requires a valid session.
 * The check lives here, once, rather than in every page: a page added later
 * without remembering to gate it would otherwise be reachable unauthenticated.
 *
 * The content column is intentionally unconstrained (no max-width) — this is
 * a working tool, not a marketing page, and editors benefit more from the
 * extra width (long-form article bodies, wide settings tables) than a
 * centred column would give them.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) redirect('/cms/login');

  return (
    <ConfirmProvider>
      <div className="flex min-h-svh flex-col bg-surface-sunken lg:flex-row">
        <CmsSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </ConfirmProvider>
  );
}
