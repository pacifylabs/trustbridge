'use client';

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import {
  adviserInputSchema,
  collectAdviserFieldErrors,
  type AdviserFieldErrors,
} from '@/lib/validation/adviser';
import { slugify } from '@/lib/validation/article';
import { SERVICES } from '@/content/services';
import type { Adviser } from '@/lib/content/types';

export function AdviserForm({ mode, adviser }: { mode: 'create' | 'edit'; adviser?: Adviser }) {
  const router = useRouter();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(adviser?.name ?? '');
  const [slug, setSlug] = useState(adviser?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [professionalTitle, setProfessionalTitle] = useState(adviser?.professionalTitle ?? '');
  const [regulatoryLevel, setRegulatoryLevel] = useState(adviser?.regulatoryLevel ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(adviser?.registrationNumber ?? '');
  const [biography, setBiography] = useState(adviser?.biography.join('\n\n') ?? '');
  const [photoUrl, setPhotoUrl] = useState(adviser?.photoUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [linkedServiceSlugs, setLinkedServiceSlugs] = useState<string[]>([
    ...(adviser?.linkedServiceSlugs ?? []),
  ]);
  const [status, setStatus] = useState<'draft' | 'published'>(adviser?.status ?? 'draft');

  const [errors, setErrors] = useState<AdviserFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleService(serviceSlug: string) {
    setLinkedServiceSlugs((current) =>
      current.includes(serviceSlug)
        ? current.filter((entry) => entry !== serviceSlug)
        : [...current, serviceSlug],
    );
  }

  async function onPhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError('');

    try {
      const body = new FormData();
      body.set('file', file);
      body.set('folder', 'advisers');

      const response = await fetch('/api/cms/upload', { method: 'POST', body });
      const result: { url?: string; message?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        setFormError(result.message ?? 'Could not upload the photo.');
        return;
      }

      setPhotoUrl(result.url);
    } catch {
      setFormError('Could not upload the photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      slug,
      name,
      professionalTitle,
      regulatoryLevel,
      registrationNumber,
      biography,
      photoUrl: photoUrl || undefined,
      linkedServiceSlugs,
      status,
    };

    const parsed = adviserInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectAdviserFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    if (parsed.data.status === 'published' && adviser?.status !== 'published') {
      if (!confirm(`Show "${parsed.data.name}" on the website now?`)) return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError('');

    try {
      const url = mode === 'create' ? '/api/cms/advisers' : `/api/cms/advisers/${adviser!.slug}`;
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: AdviserFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save the adviser.');
        return;
      }

      router.push('/cms/team');
      router.refresh();
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldId = (field: string) => `${formId}-${field}`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6 sm:grid-cols-2">
        <Field id={fieldId('name')} label="Name" required error={errors.name}>
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. Jane Doe"
              className={controlClasses}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          )}
        </Field>

        <Field
          id={fieldId('slug')}
          label="Short ID"
          required
          error={errors.slug}
          hint="A unique label used behind the scenes to identify this entry — not shown to visitors. Lowercase letters, numbers and hyphens only."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="jane-doe"
              className={controlClasses}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          )}
        </Field>

        <Field
          id={fieldId('professionalTitle')}
          label="Professional title"
          required
          error={errors.professionalTitle}
          className="sm:col-span-2"
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. Senior Immigration Adviser"
              className={controlClasses}
              value={professionalTitle}
              onChange={(event) => setProfessionalTitle(event.target.value)}
            />
          )}
        </Field>

        <Field id={fieldId('status')} label="Status" required error={errors.status}>
          {(props) => (
            <select
              {...props}
              className={controlClasses}
              value={status}
              onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}
            >
              <option value="draft">Draft (not shown on the site)</option>
              <option value="published">Published</option>
            </select>
          )}
        </Field>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden="true" />
          <h2 className="text-h4 text-strong">Regulatory information</h2>
        </div>
        <p className="mt-2 text-small leading-relaxed text-muted">
          Only enter these once the practice has explicitly confirmed them. Leave the adviser as a
          draft until then.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId('regulatoryLevel')}
            label="Regulatory level"
            required
            error={errors.regulatoryLevel}
            hint='e.g. "OISC Level 2" — leave as "To be confirmed" if unsure.'
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder="To be confirmed"
                className={controlClasses}
                value={regulatoryLevel}
                onChange={(event) => setRegulatoryLevel(event.target.value)}
              />
            )}
          </Field>

          <Field
            id={fieldId('registrationNumber')}
            label="Registration number"
            required
            error={errors.registrationNumber}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder="To be confirmed"
                className={controlClasses}
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            )}
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-h4 text-strong">Biography</h2>
        {errors.biography ? (
          <p className="mt-2 text-small font-medium text-error">{errors.biography}</p>
        ) : null}
        <p className="mt-1 text-small text-muted">Separate paragraphs with a blank line.</p>
        <textarea
          className={cn(controlClasses, 'mt-3 resize-y')}
          rows={6}
          placeholder="A short introduction to this adviser's background and experience."
          value={biography}
          onChange={(event) => setBiography(event.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-h4 text-strong">Photo</h2>
        <p className="mt-1 text-small text-muted">JPEG, PNG or WebP, under 5MB. Optional.</p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded, unoptimized image
            <img
              src={photoUrl}
              alt=""
              className="h-24 w-24 shrink-0 rounded-full border border-border-subtle object-cover"
            />
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoSelected}
            className="hidden"
            id={fieldId('photo-input')}
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {photoUrl ? 'Replace photo' : 'Upload photo'}
            </Button>
            {photoUrl ? (
              <button type="button" className="text-small text-error" onClick={() => setPhotoUrl('')}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-h4 text-strong">Linked services</h2>
        <p className="mt-1 text-small text-muted">Which service pages this adviser is shown on.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <label key={service.slug} className="flex items-center gap-2.5 text-small text-body">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--tb-c-accent)]"
                checked={linkedServiceSlugs.includes(service.slug)}
                onChange={() => toggleService(service.slug)}
              />
              {service.shortTitle}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p role="alert" className={cn('text-small font-medium text-error', !formError && 'sr-only')}>
          {formError}
        </p>
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === 'create' ? 'Create adviser' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
