'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { Recaptcha, type RecaptchaHandle } from '@/components/blocks/Recaptcha';
import {
  CONTACT_PREFERENCES,
  ENQUIRY_TYPES,
  collectFieldErrors,
  enquirySchema,
  type EnquiryFieldErrors,
} from '@/lib/validation/enquiry';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  telephone: '',
  countryOfResidence: '',
  nationality: '',
  enquiryType: '',
  description: '',
  contactPreference: '',
  consent: false,
  website: '',
  recaptchaToken: '',
};

/**
 * Enquiry form (PRD §6.1).
 *
 * The same schema validates on the client and on the server. There is no
 * database: a submission is emailed straight to the shared inbox, so the
 * status shown here reflects whether that email actually sent.
 *
 * `recaptchaSiteKey` is optional so the form still renders in an environment
 * where the client's Google account has not been set up yet; the widget, and
 * the validation that requires it, only appear once a key is supplied.
 */
export function EnquiryForm({
  className,
  recaptchaSiteKey,
}: {
  className?: string;
  recaptchaSiteKey?: string;
}) {
  const formId = useId();
  const recaptchaRef = useRef<RecaptchaHandle>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const fieldId = (name: string) => `${formId}-${name}`;

  const setValue = (name: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as keyof EnquiryFieldErrors];
      return next;
    });
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // No reCAPTCHA configured: skip the schema field so the rest of the form
    // still works while the client's Google account is set up.
    const toValidate = recaptchaSiteKey ? values : { ...values, recaptchaToken: 'unconfigured' };

    const parsed = enquirySchema.safeParse(toValidate);
    if (!parsed.success) {
      const fieldErrors = collectFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus('error');
      setSubmitMessage('Please correct the highlighted fields and try again.');

      const firstField = Object.keys(fieldErrors)[0];
      if (firstField) {
        document.getElementById(fieldId(firstField))?.focus();
      }
      return;
    }

    setStatus('submitting');
    setErrors({});
    setSubmitMessage('');

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: EnquiryFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setStatus('error');
        setSubmitMessage(
          result.message ?? 'We could not send your enquiry. Please try again, or email us directly.',
        );
        recaptchaRef.current?.reset();
        setValue('recaptchaToken', '');
        return;
      }

      setStatus('success');
      setValues({ ...EMPTY_FORM });
      recaptchaRef.current?.reset();
      setSubmitMessage(
        result.message ?? 'Thank you. Your enquiry has been received and we will be in touch.',
      );
    } catch {
      setStatus('error');
      setSubmitMessage(
        'We could not reach the server. Please check your connection, or email us directly.',
      );
      recaptchaRef.current?.reset();
      setValue('recaptchaToken', '');
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn('rounded-xl border border-border-subtle bg-surface p-8 text-center', className)}
        role="status"
        data-testid="enquiry-success"
      >
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="text-h3 text-strong">Thank you</h3>
        <p className="measure mx-auto mt-3 text-sm leading-relaxed text-muted">{submitMessage}</p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setStatus('idle');
            setSubmitMessage('');
          }}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn('rounded-xl border border-border-subtle bg-surface p-6 sm:p-8', className)}
      data-testid="enquiry-form"
    >
      <fieldset className="border-0 p-0" disabled={status === 'submitting'}>
        <legend className="sr-only">Enquiry details</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={fieldId('fullName')} label="Full name" required error={errors.fullName}>
            {(props) => (
              <input
                {...props}
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Jane Doe"
                className={controlClasses}
                value={values.fullName as string}
                onChange={(event) => setValue('fullName', event.target.value)}
              />
            )}
          </Field>

          <Field id={fieldId('email')} label="Email address" required error={errors.email}>
            {(props) => (
              <input
                {...props}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="jane@example.com"
                className={controlClasses}
                value={values.email as string}
                onChange={(event) => setValue('email', event.target.value)}
              />
            )}
          </Field>

          <Field id={fieldId('telephone')} label="Telephone" required error={errors.telephone}>
            {(props) => (
              <input
                {...props}
                type="tel"
                name="telephone"
                autoComplete="tel"
                placeholder="07417 487423"
                className={controlClasses}
                value={values.telephone as string}
                onChange={(event) => setValue('telephone', event.target.value)}
              />
            )}
          </Field>

          <Field
            id={fieldId('countryOfResidence')}
            label="Country of residence"
            required
            error={errors.countryOfResidence}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                name="countryOfResidence"
                autoComplete="country-name"
                placeholder="United Kingdom"
                className={controlClasses}
                value={values.countryOfResidence as string}
                onChange={(event) => setValue('countryOfResidence', event.target.value)}
              />
            )}
          </Field>

          <Field id={fieldId('nationality')} label="Nationality" required error={errors.nationality}>
            {(props) => (
              <input
                {...props}
                type="text"
                name="nationality"
                placeholder="e.g. Nigerian"
                className={controlClasses}
                value={values.nationality as string}
                onChange={(event) => setValue('nationality', event.target.value)}
              />
            )}
          </Field>

          <Field
            id={fieldId('enquiryType')}
            label="Type of enquiry"
            required
            error={errors.enquiryType}
          >
            {(props) => (
              <select
                {...props}
                name="enquiryType"
                className={controlClasses}
                value={values.enquiryType as string}
                onChange={(event) => setValue('enquiryType', event.target.value)}
              >
                <option value="">Please choose</option>
                {ENQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            id={fieldId('description')}
            label="Brief description of your situation"
            required
            error={errors.description}
            hint="A short summary is enough at this stage. Please do not include passport or financial details here."
            className="sm:col-span-2"
          >
            {(props) => (
              <textarea
                {...props}
                name="description"
                rows={5}
                placeholder="Tell us briefly what you need help with and where things stand so far."
                className={cn(controlClasses, 'resize-y')}
                value={values.description as string}
                onChange={(event) => setValue('description', event.target.value)}
              />
            )}
          </Field>

          <Field
            id={fieldId('contactPreference')}
            label="Preferred method of contact"
            required
            error={errors.contactPreference}
            className="sm:col-span-2"
          >
            {(props) => (
              <select
                {...props}
                name="contactPreference"
                className={controlClasses}
                value={values.contactPreference as string}
                onChange={(event) => setValue('contactPreference', event.target.value)}
              >
                <option value="">Please choose</option>
                {CONTACT_PREFERENCES.map((preference) => (
                  <option key={preference} value={preference}>
                    {preference}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        {/* Honeypot. Hidden from sighted users and from assistive technology. */}
        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
          <label htmlFor={fieldId('website')}>Leave this field blank</label>
          <input
            id={fieldId('website')}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website as string}
            onChange={(event) => setValue('website', event.target.value)}
          />
        </div>

        {recaptchaSiteKey ? (
          <div className="mt-6">
            <Recaptcha
              ref={recaptchaRef}
              siteKey={recaptchaSiteKey}
              onChange={(token) => setValue('recaptchaToken', token ?? '')}
              error={errors.recaptchaToken}
            />
          </div>
        ) : null}

        <div className="mt-6 rounded-lg border border-border-subtle bg-surface-sunken p-4">
          <div className="flex items-start gap-3">
            <input
              id={fieldId('consent')}
              type="checkbox"
              name="consent"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--tb-c-accent)]"
              checked={values.consent as boolean}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? `${fieldId('consent')}-error` : undefined}
              onChange={(event) => setValue('consent', event.target.checked)}
            />
            <label htmlFor={fieldId('consent')} className="text-sm leading-relaxed text-body">
              I have read how TrustBridge handles personal information and consent to my details
              being used to respond to this enquiry.{' '}
              <span className="text-accent-ink" aria-hidden="true">
                *
              </span>
            </label>
          </div>
          {errors.consent ? (
            <p id={`${fieldId('consent')}-error`} className="mt-2 text-sm font-medium text-error">
              {errors.consent}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            Sent over an encrypted connection.
          </p>
          <Button type="submit" variant="accent" size="lg" className="sm:min-w-48">
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending
              </>
            ) : (
              'Send enquiry'
            )}
          </Button>
        </div>

        <p
          role="alert"
          aria-live="polite"
          className={cn(
            'mt-4 text-sm font-medium',
            status === 'error' ? 'text-error' : 'sr-only',
          )}
          data-testid="enquiry-status"
        >
          {status === 'error' ? submitMessage : ''}
        </p>
      </fieldset>
    </form>
  );
}
