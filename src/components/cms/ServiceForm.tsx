'use client';

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { useConfirm } from '@/components/cms/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_FEATURE_FLAGS,
  SERVICE_FEATURE_FLAG_LABELS,
  SERVICE_ICONS,
  serviceInputSchema,
  collectServiceFieldErrors,
  slugify,
  type ServiceFieldErrors,
} from '@/lib/validation/service';
import type { Service, ServiceCategoryId, ServiceFaq, ServiceIcon } from '@/lib/content/types';

interface ImageState {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

interface SectionRow {
  readonly key: string;
  heading: string;
  body: string;
  requiresFeature: '' | 'complexMatters' | 'businessImmigration';
}

interface FaqRow {
  readonly key: string;
  question: string;
  answer: string;
}

function newKey(): string {
  return crypto.randomUUID();
}

function sectionsFromService(service?: Service): SectionRow[] {
  if (!service) {
    return [{ key: newKey(), heading: '', body: '', requiresFeature: '' }];
  }
  return service.sections.map((section) => ({
    key: newKey(),
    heading: section.heading,
    body: section.body.join('\n\n'),
    requiresFeature: section.requiresFeature ?? '',
  }));
}

function faqsFromService(service?: Service): FaqRow[] {
  if (!service || service.faqs.length === 0) return [];
  return service.faqs.map((faq) => ({ key: newKey(), question: faq.question, answer: faq.answer }));
}

export function ServiceForm({ mode, service }: { mode: 'create' | 'edit'; service?: Service }) {
  const router = useRouter();
  const confirm = useConfirm();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(service?.title ?? '');
  const [slug, setSlug] = useState(service?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [shortTitle, setShortTitle] = useState(service?.shortTitle ?? '');
  const [category, setCategory] = useState<ServiceCategoryId>(service?.category ?? SERVICE_CATEGORIES[0]);
  const [summary, setSummary] = useState(service?.summary ?? '');
  const [icon, setIcon] = useState<ServiceIcon>(service?.icon ?? SERVICE_ICONS[0]);
  const [image, setImage] = useState<ImageState | null>(service?.image ?? null);
  const [imageAlt, setImageAlt] = useState(service?.image?.alt ?? '');
  const [uploading, setUploading] = useState(false);
  const [intro, setIntro] = useState(service?.intro.join('\n\n') ?? '');
  const [audience, setAudience] = useState(service?.audience.join('\n') ?? '');
  const [includes, setIncludes] = useState(service?.includes.join('\n') ?? '');
  const [sections, setSections] = useState<SectionRow[]>(sectionsFromService(service));
  const [faqs, setFaqs] = useState<FaqRow[]>(faqsFromService(service));
  const [order, setOrder] = useState(service ? String(service.order) : '');
  const [requiresFeature, setRequiresFeature] = useState<'' | 'complexMatters' | 'businessImmigration'>(
    service?.requiresFeature ?? '',
  );
  const [status, setStatus] = useState<'draft' | 'published'>(service?.status ?? 'draft');
  const [seoTitle, setSeoTitle] = useState(service?.seo.title ?? '');
  const [seoDescription, setSeoDescription] = useState(service?.seo.description ?? '');

  const [errors, setErrors] = useState<ServiceFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateSection(key: string, patch: Partial<SectionRow>) {
    setSections((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addSection() {
    setSections((current) => [...current, { key: newKey(), heading: '', body: '', requiresFeature: '' }]);
  }

  function removeSection(key: string) {
    setSections((current) => current.filter((row) => row.key !== key));
  }

  function updateFaq(key: string, patch: Partial<FaqRow>) {
    setFaqs((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addFaq() {
    setFaqs((current) => [...current, { key: newKey(), question: '', answer: '' }]);
  }

  function removeFaq(key: string) {
    setFaqs((current) => current.filter((row) => row.key !== key));
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
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
          reject(new Error('Could not read that photo.'));
        };
        img.src = objectUrl;
      });

      const body = new FormData();
      body.set('file', file);
      body.set('folder', 'services');

      const response = await fetch('/api/cms/upload', { method: 'POST', body });
      const result: { url?: string; message?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        setFormError(result.message ?? 'Could not upload the photo.');
        return;
      }

      setImage({ src: result.url, alt: imageAlt, width: dimensions.width, height: dimensions.height });
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
      title,
      shortTitle,
      category,
      summary,
      icon,
      image: image ? { ...image, alt: imageAlt } : undefined,
      intro,
      audience,
      includes,
      sections: sections.map((row) => ({
        heading: row.heading,
        body: row.body,
        requiresFeature: row.requiresFeature || undefined,
      })),
      faqs: faqs.map((row): ServiceFaq => ({ question: row.question, answer: row.answer })),
      order,
      requiresFeature: requiresFeature || undefined,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    const parsed = serviceInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectServiceFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    if (parsed.data.status === 'published' && service?.status !== 'published') {
      if (!(await confirm(`Show "${parsed.data.title}" on the website now?`))) return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError('');

    try {
      const url = mode === 'create' ? '/api/cms/services' : `/api/cms/services/${service!.slug}`;
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: ServiceFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save the service.');
        return;
      }

      router.push('/cms/services');
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
      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6 sm:grid-cols-2">
        <Field id={fieldId('title')} label="Page title" required error={errors.title} className="sm:col-span-2">
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. Spouse and partner visas"
              className={controlClasses}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          )}
        </Field>

        <Field
          id={fieldId('slug')}
          label="Page address"
          required
          error={errors.slug}
          hint="Part of the page's web address, e.g. yoursite.com/services/this-part. Lowercase letters, numbers and hyphens only."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="spouse-and-partner-visas"
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
          id={fieldId('shortTitle')}
          label="Short title"
          required
          error={errors.shortTitle}
          hint="Used on cards and in menus, where the full title is too long."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. Spouse and partner"
              className={controlClasses}
              value={shortTitle}
              onChange={(event) => setShortTitle(event.target.value)}
            />
          )}
        </Field>

        <Field id={fieldId('category')} label="Category" required error={errors.category}>
          {(props) => (
            <select
              {...props}
              className={controlClasses}
              value={category}
              onChange={(event) => setCategory(event.target.value as ServiceCategoryId)}
            >
              {SERVICE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {SERVICE_CATEGORY_LABELS[option]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id={fieldId('icon')} label="Icon" required error={errors.icon}>
          {(props) => (
            <select
              {...props}
              className={controlClasses}
              value={icon}
              onChange={(event) => setIcon(event.target.value as ServiceIcon)}
            >
              {SERVICE_ICONS.map((option) => (
                <option key={option} value={option}>
                  {option.replace('-', ' ')}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id={fieldId('summary')}
          label="Summary"
          required
          error={errors.summary}
          hint="Shown on the services index and in search results."
          className="sm:col-span-2"
        >
          {(props) => (
            <textarea
              {...props}
              rows={2}
              placeholder="A one or two sentence overview of who this service is for and what it covers."
              className={cn(controlClasses, 'resize-y')}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          )}
        </Field>

        <Field
          id={fieldId('order')}
          label="Position"
          required
          error={errors.order}
          hint="Where this appears in the services list — 1 shows first."
        >
          {(props) => (
            <input
              {...props}
              type="number"
              min={1}
              placeholder="1"
              className={controlClasses}
              value={order}
              onChange={(event) => setOrder(event.target.value)}
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

        <Field
          id={fieldId('requiresFeature')}
          label="Only show once approved"
          error={errors.requiresFeature}
          hint="Leave as 'No restriction' unless this whole page needs to stay hidden until a specific approval switch is turned on in Settings."
          className="sm:col-span-2"
        >
          {(props) => (
            <select
              {...props}
              className={controlClasses}
              value={requiresFeature}
              onChange={(event) =>
                setRequiresFeature(event.target.value as '' | 'complexMatters' | 'businessImmigration')
              }
            >
              <option value="">No restriction</option>
              {SERVICE_FEATURE_FLAGS.map((flag) => (
                <option key={flag} value={flag}>
                  {SERVICE_FEATURE_FLAG_LABELS[flag]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-h4 text-strong">Photo</h2>
        <p className="mt-1 text-small text-muted">JPEG, PNG or WebP, under 5MB. Optional.</p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded, unoptimized image
            <img
              src={image.src}
              alt=""
              className="h-32 w-48 shrink-0 rounded-lg border border-border-subtle object-cover"
            />
          ) : null}

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onImageSelected}
              className="hidden"
              id={fieldId('image-input')}
            />
            <div className="flex flex-wrap items-center gap-3">
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
                {image ? 'Replace photo' : 'Upload photo'}
              </Button>
              {image ? (
                <button
                  type="button"
                  className="text-small text-error"
                  onClick={() => {
                    setImage(null);
                    setImageAlt('');
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>

            {image ? (
              <div className="mt-3">
                <label htmlFor={fieldId('image-alt')} className="text-small font-medium text-strong">
                  Photo description (for screen readers)
                </label>
                <input
                  id={fieldId('image-alt')}
                  type="text"
                  placeholder="e.g. A couple on their wedding day"
                  className={cn(controlClasses, 'mt-1.5')}
                  value={imageAlt}
                  onChange={(event) => {
                    setImageAlt(event.target.value);
                    setImage((current) => (current ? { ...current, alt: event.target.value } : current));
                  }}
                />
                {errors['image.alt'] ? (
                  <p className="mt-1.5 text-small font-medium text-error">{errors['image.alt']}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-h4 text-strong">Opening paragraphs</h2>
        {errors.intro ? <p className="mt-2 text-small font-medium text-error">{errors.intro}</p> : null}
        <p className="mt-1 text-small text-muted">
          Shown at the top of the page, under the heading. Separate paragraphs with a blank line.
        </p>
        <textarea
          className={cn(controlClasses, 'mt-3 resize-y')}
          rows={4}
          placeholder="What the Home Office needs to see, and what makes this route straightforward or difficult."
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
        />
      </div>

      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6 sm:grid-cols-2">
        <div>
          <h2 className="text-h4 text-strong">Who this is for</h2>
          {errors.audience ? (
            <p className="mt-2 text-small font-medium text-error">{errors.audience}</p>
          ) : null}
          <p className="mt-1 text-small text-muted">One type of client per line.</p>
          <textarea
            className={cn(controlClasses, 'mt-3 resize-y')}
            rows={5}
            placeholder={'Partners of British citizens applying from outside the UK\nCouples switching into the partner route from another visa'}
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          />
        </div>

        <div>
          <h2 className="text-h4 text-strong">What working with us includes</h2>
          {errors.includes ? (
            <p className="mt-2 text-small font-medium text-error">{errors.includes}</p>
          ) : null}
          <p className="mt-1 text-small text-muted">One item per line.</p>
          <textarea
            className={cn(controlClasses, 'mt-3 resize-y')}
            rows={5}
            placeholder={'Assessment of which route fits your circumstances\nReview of your completed forms before submission'}
            value={includes}
            onChange={(event) => setIncludes(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-h4 text-strong">Page sections</h2>
            <p className="mt-1 text-small text-muted">
              The main body of the page — each one gets its own heading and paragraphs.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add section
          </Button>
        </div>
        {errors.sections ? (
          <p className="mt-2 text-small font-medium text-error">{errors.sections}</p>
        ) : null}

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
                      placeholder="e.g. The financial requirement"
                      className={controlClasses}
                      value={row.heading}
                      onChange={(event) => updateSection(row.key, { heading: event.target.value })}
                    />
                  )}
                </Field>

                <Field
                  id={fieldId(`section-${index}-body`)}
                  label="Paragraphs"
                  required
                  error={errors[`sections.${index}.body`]}
                  hint="Separate paragraphs with a blank line."
                >
                  {(props) => (
                    <textarea
                      {...props}
                      rows={4}
                      placeholder="What this part of the page needs to explain."
                      className={cn(controlClasses, 'resize-y')}
                      value={row.body}
                      onChange={(event) => updateSection(row.key, { body: event.target.value })}
                    />
                  )}
                </Field>

                <Field
                  id={fieldId(`section-${index}-feature`)}
                  label="Only show once approved"
                  hint="Leave as 'No restriction' unless this section needs to stay hidden until approval."
                  error={errors[`sections.${index}.requiresFeature`]}
                >
                  {(props) => (
                    <select
                      {...props}
                      className={controlClasses}
                      value={row.requiresFeature}
                      onChange={(event) =>
                        updateSection(row.key, {
                          requiresFeature: event.target.value as '' | 'complexMatters' | 'businessImmigration',
                        })
                      }
                    >
                      <option value="">No restriction</option>
                      {SERVICE_FEATURE_FLAGS.map((flag) => (
                        <option key={flag} value={flag}>
                          {SERVICE_FEATURE_FLAG_LABELS[flag]}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-h4 text-strong">Common questions</h2>
            <p className="mt-1 text-small text-muted">Optional. Shown near the bottom of the page.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addFaq}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add question
          </Button>
        </div>

        {faqs.length > 0 ? (
          <div className="mt-5 flex flex-col gap-5">
            {faqs.map((row, index) => (
              <div key={row.key} className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-small font-semibold text-strong">Question {index + 1}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-small text-error hover:opacity-80"
                    onClick={() => removeFaq(row.key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid gap-4">
                  <Field
                    id={fieldId(`faq-${index}-question`)}
                    label="Question"
                    required
                    error={errors[`faqs.${index}.question`]}
                  >
                    {(props) => (
                      <input
                        {...props}
                        type="text"
                        placeholder="e.g. How long does an application take to decide?"
                        className={controlClasses}
                        value={row.question}
                        onChange={(event) => updateFaq(row.key, { question: event.target.value })}
                      />
                    )}
                  </Field>

                  <Field
                    id={fieldId(`faq-${index}-answer`)}
                    label="Answer"
                    required
                    error={errors[`faqs.${index}.answer`]}
                  >
                    {(props) => (
                      <textarea
                        {...props}
                        rows={3}
                        placeholder="A clear, direct answer, without guaranteeing an outcome."
                        className={cn(controlClasses, 'resize-y')}
                        value={row.answer}
                        onChange={(event) => updateFaq(row.key, { answer: event.target.value })}
                      />
                    )}
                  </Field>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <details className="rounded-xl border border-border-subtle bg-surface p-6">
        <summary className="cursor-pointer text-h4 text-strong">Search engine listing (optional)</summary>
        <p className="mt-2 text-small text-muted">
          What shows as the title and description when this page appears in Google. Leave blank to
          use the page title and summary above.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId('seoTitle')}
            label="Search result title"
            hint="Defaults to the page title."
            error={errors.seoTitle}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder={title || 'Defaults to the page title above'}
                className={controlClasses}
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
              />
            )}
          </Field>
          <Field
            id={fieldId('seoDescription')}
            label="Search result description"
            hint="Defaults to the summary."
            error={errors.seoDescription}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder={summary || 'Defaults to the summary above'}
                className={controlClasses}
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
              />
            )}
          </Field>
        </div>
      </details>

      <div className="flex items-center justify-between">
        <p role="alert" className={cn('text-small font-medium text-error', !formError && 'sr-only')}>
          {formError}
        </p>
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === 'create' ? 'Create service' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
