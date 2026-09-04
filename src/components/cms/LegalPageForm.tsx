'use client';

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import {
  legalPageInputSchema,
  collectLegalPageFieldErrors,
  type LegalPageFieldErrors,
  type LegalPageInput,
} from '@/lib/validation/legal';

interface LogoState {
  readonly key: string;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

interface SectionRow {
  readonly key: string;
  heading: string;
  body: string;
}

function newKey(): string {
  return crypto.randomUUID();
}

export function LegalPageForm({ slug, initial }: { slug: string; initial: LegalPageInput }) {
  const router = useRouter();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [sections, setSections] = useState<SectionRow[]>(
    initial.sections.map((section) => ({ key: newKey(), ...section })),
  );
  const [logos, setLogos] = useState<LogoState[]>(
    initial.logos.map((logo) => ({ key: newKey(), ...logo })),
  );
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState<LegalPageFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateSection(key: string, patch: Partial<SectionRow>) {
    setSections((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addSection() {
    setSections((current) => [...current, { key: newKey(), heading: '', body: '' }]);
  }

  function removeSection(key: string) {
    setSections((current) => current.filter((row) => row.key !== key));
  }

  function removeLogo(key: string) {
    setLogos((current) => current.filter((logo) => logo.key !== key));
  }

  async function onLogoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError('');

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not read that image.'));
        };
        img.src = objectUrl;
      });

      const body = new FormData();
      body.set('file', file);
      body.set('folder', 'legal');

      const response = await fetch('/api/cms/upload', { method: 'POST', body });
      const result: { url?: string; message?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        setFormError(result.message ?? 'Could not upload the image.');
        return;
      }

      setLogos((current) => [
        ...current,
        { key: newKey(), src: result.url!, alt: '', width: dimensions.width, height: dimensions.height },
      ]);
    } catch {
      setFormError('Could not upload the image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title,
      summary,
      sections: sections.map(({ heading, body }) => ({ heading, body })),
      logos: logos.map(({ src, alt, width, height }) => ({ src, alt, width, height })),
    };

    const parsed = legalPageInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectLegalPageFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError('');
    setMessage('');

    try {
      const response = await fetch(`/api/cms/legal/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: LegalPageFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save this page.');
        return;
      }

      setMessage('Saved.');
      router.refresh();
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldId = (name: string) => `${formId}-${name}`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6">
        <Field id={fieldId('title')} label="Page title" required error={errors.title}>
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. Privacy policy"
              className={controlClasses}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          )}
        </Field>

        <Field
          id={fieldId('summary')}
          label="Summary"
          required
          error={errors.summary}
          hint="Shown under the title at the top of the page."
        >
          {(props) => (
            <textarea
              {...props}
              rows={2}
              placeholder="A one-sentence summary of what this page covers."
              className={cn(controlClasses, 'resize-y')}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-h4 text-strong">Official logos and badges</h2>
            <p className="mt-1 text-small text-muted">
              Optional. Only add official artwork supplied by the regulator — never a badge created
              for the site.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onLogoSelected}
            className="hidden"
            id={fieldId('logo-input')}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || logos.length >= 4}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            Upload image
          </Button>
        </div>

        {logos.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4">
            {logos.map((logo, index) => (
              <div key={logo.key} className="flex items-start gap-4 rounded-lg border border-border-subtle bg-surface-sunken p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded, unoptimized image */}
                <img src={logo.src} alt="" className="h-16 w-16 shrink-0 rounded-md border border-border-subtle object-contain bg-white" />
                <div className="min-w-0 flex-1">
                  <label htmlFor={fieldId(`logo-alt-${index}`)} className="text-small font-medium text-strong">
                    Description (for screen readers)
                  </label>
                  <input
                    id={fieldId(`logo-alt-${index}`)}
                    type="text"
                    placeholder="e.g. IAA registration mark"
                    className={cn(controlClasses, 'mt-1.5')}
                    value={logo.alt}
                    onChange={(event) =>
                      setLogos((current) =>
                        current.map((l) => (l.key === logo.key ? { ...l, alt: event.target.value } : l)),
                      )
                    }
                  />
                  {errors[`logos.${index}.alt`] ? (
                    <p className="mt-1.5 text-small font-medium text-error">{errors[`logos.${index}.alt`]}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 text-small text-error hover:opacity-80"
                  onClick={() => removeLogo(logo.key)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h4 text-strong">Sections</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add section
          </Button>
        </div>
        {errors.sections ? <p className="mt-2 text-small font-medium text-error">{errors.sections}</p> : null}

        <div className="mt-5 flex flex-col gap-5">
          {sections.map((row, index) => (
            <div key={row.key} className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-small font-semibold text-strong">Section {index + 1}</span>
                {sections.length > 1 ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-small text-error hover:opacity-80"
                    onClick={() => removeSection(row.key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-4">
                <Field
                  id={fieldId(`section-${index}-heading`)}
                  label="Heading"
                  required
                  error={errors[`sections.${index}.heading`]}
                >
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      placeholder="e.g. How we handle your information"
                      className={controlClasses}
                      value={row.heading}
                      onChange={(event) => updateSection(row.key, { heading: event.target.value })}
                    />
                  )}
                </Field>

                <Field
                  id={fieldId(`section-${index}-body`)}
                  label="Text"
                  required
                  error={errors[`sections.${index}.body`]}
                >
                  {(props) => (
                    <textarea
                      {...props}
                      rows={4}
                      placeholder="Write the text for this section."
                      className={cn(controlClasses, 'resize-y')}
                      value={row.body}
                      onChange={(event) => updateSection(row.key, { body: event.target.value })}
                    />
                  )}
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save changes
        </Button>
        {message ? <p className="text-small font-medium text-success">{message}</p> : null}
        {formError ? <p className="text-small font-medium text-error">{formError}</p> : null}
      </div>
    </form>
  );
}
