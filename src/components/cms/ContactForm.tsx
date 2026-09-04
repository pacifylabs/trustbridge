'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import {
  contactInputSchema,
  collectContactFieldErrors,
  type ContactFieldErrors,
  type ContactInput,
} from '@/lib/validation/contact';

export function ContactForm({ initialContact }: { initialContact: ContactInput }) {
  const router = useRouter();

  const [email, setEmail] = useState(initialContact.email);
  const [phone, setPhone] = useState(initialContact.phone);
  const [address, setAddress] = useState(initialContact.address ?? '');
  const [hours, setHours] = useState(initialContact.hours ?? '');

  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      email,
      phone,
      address: address || undefined,
      hours: hours || undefined,
    };

    const parsed = contactInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(collectContactFieldErrors(parsed.error));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    setErrors({});
    setFormError('');
    setMessage('');

    try {
      const response = await fetch('/api/cms/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result: { message?: string; fieldErrors?: ContactFieldErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message ?? 'Could not save the contact details.');
        return;
      }

      setMessage('Saved.');
      router.refresh();
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <div className="grid gap-5 rounded-xl border border-border-subtle bg-surface p-6 sm:grid-cols-2">
        <Field
          id="contact-email"
          label="General email"
          required
          error={errors.email}
          hint="Website enquiries are sent here."
        >
          {(props) => (
            <input
              {...props}
              type="email"
              className={controlClasses}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </Field>

        <Field
          id="contact-phone"
          label="Phone number"
          required
          error={errors.phone}
          hint="Shown as typed, e.g. 07417 487423."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              className={controlClasses}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          )}
        </Field>

        <Field
          id="contact-address"
          label="Office address"
          error={errors.address}
          hint="One line per address line. Leave blank if not ready to publish yet."
          className="sm:col-span-2"
        >
          {(props) => (
            <textarea
              {...props}
              rows={3}
              className={cn(controlClasses, 'resize-y')}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          )}
        </Field>

        <Field
          id="contact-hours"
          label="Office hours"
          error={errors.hours}
          hint='e.g. "Monday to Friday, 9am to 5pm". Leave blank if not ready to publish yet.'
          className="sm:col-span-2"
        >
          {(props) => (
            <input
              {...props}
              type="text"
              className={controlClasses}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="accent" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save changes
        </Button>
        {message ? <p className="text-small font-medium text-success">{message}</p> : null}
        {formError ? <p className="text-small font-medium text-error">{formError}</p> : null}
      </div>
    </form>
  );
}
