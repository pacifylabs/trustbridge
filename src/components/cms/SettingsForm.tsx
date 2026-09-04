'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import type { CmsSettings } from '@/lib/cms/settings';

/** A single labelled on/off switch, with room for a description and a warning tone. */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  tone = 'default',
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-6 rounded-lg border p-4',
        tone === 'danger' ? 'border-error/30 bg-error/5' : 'border-border-subtle bg-surface',
      )}
    >
      <div>
        <p className="text-small font-semibold text-strong">{label}</p>
        <p className="mt-1 max-w-md text-small leading-relaxed text-muted">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} label={label} tone={tone} />
    </div>
  );
}

/**
 * Describes what would newly become visible to the public if `next` were
 * saved over `initial`, in plain terms an editor can weigh before confirming
 * — never which is the "more open" value, just what actually changes.
 */
function describeNewlyVisible(initial: CmsSettings, next: CmsSettings): string[] {
  const changes: string[] = [];
  if (next.siteLaunched && !initial.siteLaunched) {
    changes.push('The whole site will go live for every visitor, replacing the Coming Soon page.');
  }
  if (next.resourcesDataSource === 'cms' && initial.resourcesDataSource !== 'cms') {
    changes.push('The Resources page will switch from the sample articles to your own, real articles.');
  }
  if (next.featureComplexMatters && !initial.featureComplexMatters) {
    changes.push('The Complex Immigration Matters page will become visible on the site.');
  }
  if (next.featureBusinessImmigration && !initial.featureBusinessImmigration) {
    changes.push('The full detail on the Business Immigration page will become visible.');
  }
  return changes;
}

export function SettingsForm({
  initialSettings,
  readOnly,
}: {
  initialSettings: CmsSettings;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  async function save() {
    const newlyVisible = describeNewlyVisible(initialSettings, settings);
    if (newlyVisible.length > 0) {
      const confirmed = confirm(
        `This will make the following visible to the public:\n\n${newlyVisible.map((line) => `• ${line}`).join('\n')}\n\nContinue?`,
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result: { settings?: CmsSettings; message?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? 'Could not save settings.');
        return;
      }

      setMessage('Saved.');
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-h4 text-strong">Go live</h2>
        <div className="mt-3">
          <ToggleRow
            tone="danger"
            label="Publish the site"
            description="While this is off, every visitor sees a 'coming soon' page instead of the real site. Turn it on when you're ready to go live — the real site appears for everyone straight away, so only switch it on when you're sure."
            checked={settings.siteLaunched}
            disabled={readOnly}
            onChange={(value) => setSettings((current) => ({ ...current, siteLaunched: value }))}
          />
        </div>
      </section>

      <section>
        <h2 className="text-h4 text-strong">Resources content</h2>
        <p className="mt-1 text-small text-muted">
          What the public Resources page shows, independent of what has been written in{' '}
          <span className="font-medium text-strong">Articles</span>.
        </p>
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface p-4">
          <label htmlFor="resources-source" className="text-small font-semibold text-strong">
            Article source
          </label>
          <select
            id="resources-source"
            className={cn(controlClasses, 'mt-2 max-w-xs')}
            value={settings.resourcesDataSource}
            disabled={readOnly}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                resourcesDataSource: event.target.value as CmsSettings['resourcesDataSource'],
              }))
            }
          >
            <option value="demo">Sample articles (for previewing the design)</option>
            <option value="cms">Your own articles, written in Articles</option>
          </select>
          <p className="mt-2 text-small leading-relaxed text-muted">
            Keep this on sample articles while real ones are still being written, so visitors never
            see a half-finished page. Switch it once there is real content ready in Articles.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-h4 text-strong">Service visibility</h2>
        <p className="mt-1 text-small text-muted">
          Only turn these on once the practice&apos;s authorisation for that area has been
          confirmed — leave them off until then.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <ToggleRow
            label="Complex Immigration Matters"
            description="Publishes the Complex Immigration Matters service page and adds it to navigation, the services index, the sitemap and structured data."
            checked={settings.featureComplexMatters}
            disabled={readOnly}
            onChange={(value) => setSettings((current) => ({ ...current, featureComplexMatters: value }))}
          />
          <ToggleRow
            label="Business Immigration (full detail)"
            description="Reveals the sponsor licence and business/investment route sections on the Business Immigration page. The page itself stays visible either way."
            checked={settings.featureBusinessImmigration}
            disabled={readOnly}
            onChange={(value) =>
              setSettings((current) => ({ ...current, featureBusinessImmigration: value }))
            }
          />
        </div>
      </section>

      <div className="flex items-center gap-4 border-t border-border-subtle pt-6">
        <Button variant="accent" onClick={save} disabled={readOnly || saving || !dirty}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save changes
        </Button>
        {message ? <p className="text-small font-medium text-success">{message}</p> : null}
        {error ? <p className="text-small font-medium text-error">{error}</p> : null}
      </div>
    </div>
  );
}
