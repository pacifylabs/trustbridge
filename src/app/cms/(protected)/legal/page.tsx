import type { Metadata } from 'next';
import Link from 'next/link';
import { isCmsConfigured } from '@/lib/env';
import { listAllLegalPagesForAdmin } from '@/lib/cms/legal';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Legal pages' };

export default async function CmsLegalPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Legal pages aren't ready yet" />;
  }

  const pages = await listAllLegalPagesForAdmin();

  return (
    <div>
      <h1 className="text-h2 text-strong">Legal pages</h1>
      <p className="mt-2 max-w-2xl text-small leading-relaxed text-muted">
        These pages always exist on the site — Privacy policy, Cookie policy, Terms and
        conditions, Complaints procedure, Regulatory information, and Accessibility. You can edit
        what each one says here; new pages aren&apos;t added or removed from this list.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="w-full text-left text-small">
          <thead className="border-b border-border-subtle bg-surface-sunken text-micro font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {pages.map((page) => (
              <tr key={page.slug}>
                <td className="px-4 py-3 font-medium text-strong">{page.title}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/cms/legal/${page.slug}`} className="text-link hover:text-link-hover">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
