import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { isCmsConfigured } from '@/lib/env';
import { listAllAdvisers } from '@/lib/cms/advisers';
import { Button } from '@/components/ui/Button';
import { AdvisersList } from '@/components/cms/AdvisersList';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Team' };

export default async function CmsTeamPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Team isn't ready yet" />;
  }

  const advisers = await listAllAdvisers();

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
        <p className="text-small leading-relaxed text-strong">
          Only enter a regulatory level and registration number once the practice has confirmed
          them. A regulatory claim that turns out to be wrong is a serious problem, not a detail to
          fix later.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-strong">Team</h1>
        <Button href="/cms/team/new" variant="accent">
          New adviser
        </Button>
      </div>

      <div className="mt-8">
        <AdvisersList advisers={advisers} />
      </div>
    </div>
  );
}
