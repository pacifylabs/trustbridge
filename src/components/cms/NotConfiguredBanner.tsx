import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shown in place of a CMS section when its storage hasn't been set up yet.
 *
 * This is a setup step for whoever builds and hosts the site, not something
 * the TrustBridge team can fix from here — so the message points them to
 * their developer rather than naming environment variables or hosting
 * dashboards they have no reason to know about.
 */
export function NotConfiguredBanner({ title }: { title?: string }) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl border border-border-subtle bg-surface p-6"
      data-testid="cms-not-configured"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
      <div>
        {title ? <h1 className="text-h3 text-strong">{title}</h1> : null}
        <p className={cn('max-w-2xl text-small leading-relaxed text-muted', title && 'mt-2')}>
          This part of the site isn&apos;t set up yet. Please contact your website developer so
          they can finish the setup — you&apos;ll be able to add content here once that&apos;s
          done.
        </p>
      </div>
    </div>
  );
}
