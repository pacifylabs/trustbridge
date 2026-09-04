import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { getSettings } from '@/lib/cms/settings';
import { SettingsForm } from '@/components/cms/SettingsForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Settings' };

export default async function CmsSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="text-h2 text-strong">Settings</h1>
      <p className="mt-2 text-small leading-relaxed text-muted">
        Controls what the public site shows, without needing a developer or a redeploy.
      </p>

      {!isCmsConfigured() ? (
        <div className="mt-6">
          <NotConfiguredBanner />
        </div>
      ) : null}

      <div className="mt-8">
        <SettingsForm initialSettings={settings} readOnly={!isCmsConfigured()} />
      </div>
    </div>
  );
}
