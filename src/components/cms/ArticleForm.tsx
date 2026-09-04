'use client';

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';
import {
  ARTICLE_CATEGORIES,
  articleInputSchema,
  collectArticleFieldErrors,
  slugify,
  type ArticleFieldErrors,
} from '@/lib/validation/article';
import type { Article, ArticleCategory } from '@/lib/content/types';

interface ImageState {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ArticleForm({ mode, article }: { mode: 'create' | 'edit'; article?: Article }) {
  const router = useRouter();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [category, setCategory] = useState<ArticleCategory>(article?.category ?? ARTICLE_CATEGORIES[0]);
  const [author, setAuthor] = useState(article?.author ?? 'TrustBridge Immigration Services');
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt ?? todayIsoDate());
  const [status, setStatus] = useState<'draft' | 'published'>(article?.status ?? 'draft');
  const [image, setImage] = useState<ImageState | null>(article?.image ?? null);
  const [imageAlt, setImageAlt] = useState(article?.image?.alt ?? '');
  const [uploading, setUploading] = useState(false);
  const [body, setBody] = useState(article?.body ?? '');
  const [seoTitle, setSeoTitle] = useState(article?.seo.title ?? '');
  const [seoDescription, setSeoDescription] = useState(article?.seo.description ?? '');

  const [errors, setErrors] = useState<ArticleFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
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
          reject(new Error('Could not read that image.'));
        };
        img.src = objectUrl;
      });

      const body = new FormData();
      body.set('file', file);
      body.set('folder', 'articles');

      const response = await fetch('/api/cms/upload', { method: 'POST', body });
      const result: { url?: string; message?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        setFormError(result.message ?? 'Could not upload the image.');
        return;
      }

      setImage({ src: result.url, alt: imageAlt, width: dimensions.width, height: dimensions.height });
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
      slug,
      title,
      excerpt,
      category,
      author,
      publishedAt,
      status,
      image: image ? { ...image, alt: imageAlt } : undefined,
      body,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    const parsed = articleInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectArticleFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    if (parsed.data.status === 'published' && article?.status !== 'published') {
      if (!confirm(`Show "${parsed.data.title}" on the website now?`)) return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError('');

    try {
      const url = mode === 'create' ? '/api/cms/articles' : `/api/cms/articles/${article!.slug}`;
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: ArticleFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save the article.');
        return;
      }

      router.push('/cms/articles');
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
        <Field id={fieldId('title')} label="Title" required error={errors.title} className="sm:col-span-2">
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="e.g. What to expect at your first consultation"
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
          hint="Part of the page's web address, e.g. yoursite.com/resources/this-part. Lowercase letters, numbers and hyphens only."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="what-to-expect-at-your-first-consultation"
              className={controlClasses}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          )}
        </Field>

        <Field id={fieldId('category')} label="Category" required error={errors.category}>
          {(props) => (
            <select
              {...props}
              className={controlClasses}
              value={category}
              onChange={(event) => setCategory(event.target.value as ArticleCategory)}
            >
              {ARTICLE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id={fieldId('excerpt')}
          label="Excerpt"
          required
          error={errors.excerpt}
          hint="Shown on the Resources card grid."
          className="sm:col-span-2"
        >
          {(props) => (
            <textarea
              {...props}
              rows={2}
              placeholder="A short guide to how the first meeting works, what to bring, and what you will have by the end of it."
              className={cn(controlClasses, 'resize-y')}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          )}
        </Field>

        <Field id={fieldId('author')} label="Author" required error={errors.author}>
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="TrustBridge Immigration Services"
              className={controlClasses}
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          )}
        </Field>

        <Field id={fieldId('publishedAt')} label="Published date" required error={errors.publishedAt}>
          {(props) => (
            <input
              {...props}
              type="date"
              className={controlClasses}
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
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
        <h2 className="text-h4 text-strong">Cover image</h2>
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
                {image ? 'Replace image' : 'Upload image'}
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
                  Image description (for screen readers)
                </label>
                <input
                  id={fieldId('image-alt')}
                  type="text"
                  placeholder="e.g. A couple reviewing documents together at a table"
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
        <h2 className="text-h4 text-strong">Body</h2>
        {errors.body ? <p className="mt-2 text-small font-medium text-error">{errors.body}</p> : null}

        <div className="mt-4">
          <RichTextEditor value={body} onChange={setBody} />
        </div>
      </div>

      <details className="rounded-xl border border-border-subtle bg-surface p-6">
        <summary className="cursor-pointer text-h4 text-strong">Search engine listing (optional)</summary>
        <p className="mt-2 text-small text-muted">
          What shows as the title and description when this page appears in Google. Leave blank to
          use the title and excerpt above.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId('seoTitle')}
            label="Search result title"
            hint="Defaults to the article title."
            error={errors.seoTitle}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder={title || 'Defaults to the title above'}
                className={controlClasses}
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
              />
            )}
          </Field>
          <Field
            id={fieldId('seoDescription')}
            label="Search result description"
            hint="Defaults to the excerpt."
            error={errors.seoDescription}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                placeholder={excerpt || 'Defaults to the excerpt above'}
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
          {mode === 'create' ? 'Create article' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
