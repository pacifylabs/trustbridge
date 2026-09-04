'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { useConfirm } from '@/components/cms/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  testimonialInputSchema,
  collectTestimonialFieldErrors,
  type TestimonialFieldErrors,
} from '@/lib/validation/testimonial';
import { slugify } from '@/lib/validation/article';
import type { Testimonial } from '@/lib/content/types';

export function TestimonialForm({
  mode,
  testimonial,
}: {
  mode: 'create' | 'edit';
  testimonial?: Testimonial;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const formId = useId();

  const [quote, setQuote] = useState(testimonial?.quote ?? '');
  const [attribution, setAttribution] = useState(testimonial?.attribution ?? '');
  const [location, setLocation] = useState(testimonial?.location ?? '');
  const [slug, setSlug] = useState(testimonial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [status, setStatus] = useState<'draft' | 'published'>(testimonial?.status ?? 'draft');

  const [errors, setErrors] = useState<TestimonialFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onAttributionChange(value: string) {
    setAttribution(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = { slug, quote, attribution, location, status };

    const parsed = testimonialInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectTestimonialFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    if (parsed.data.status === 'published' && testimonial?.status !== 'published') {
      if (!(await confirm('Show this testimonial on the website now?'))) return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError('');

    try {
      const url =
        mode === 'create' ? '/api/cms/testimonials' : `/api/cms/testimonials/${testimonial!.slug}`;
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: TestimonialFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save the testimonial.');
        return;
      }

      router.push('/cms/testimonials');
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
      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <Field
          id={fieldId('quote')}
          label="Quote"
          required
          error={errors.quote}
          hint="Do not describe or imply the outcome of an application — a case-outcome claim will be rejected."
        >
          {(props) => (
            <textarea
              {...props}
              className={cn(controlClasses, 'resize-y')}
              rows={4}
              placeholder="What did this client say about working with us?"
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6 sm:grid-cols-2">
        <Field
          id={fieldId('attribution')}
          label="Attribution"
          required
          error={errors.attribution}
          hint='A role, not a name, e.g. "Spouse visa client".'
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="Spouse visa client"
              className={controlClasses}
              value={attribution}
              onChange={(event) => onAttributionChange(event.target.value)}
            />
          )}
        </Field>

        <Field id={fieldId('location')} label="Location" required error={errors.location}>
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="Manchester"
              className={controlClasses}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
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
              placeholder="spouse-visa-client-manchester"
              className={controlClasses}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
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

      <div className="flex items-center justify-between">
        <p role="alert" className={cn('text-small font-medium text-error', !formError && 'sr-only')}>
          {formError}
        </p>
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === 'create' ? 'Create testimonial' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
