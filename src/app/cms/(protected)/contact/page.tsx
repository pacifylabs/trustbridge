import type { Metadata } from 'next';
import { isCmsConfigured } from '@/lib/env';
import { getContactForAdmin } from '@/lib/cms/contact';
import { ContactForm } from '@/components/cms/ContactForm';
import { NotConfiguredBanner } from '@/components/cms/NotConfiguredBanner';

export const metadata: Metadata = { title: 'Contact details' };

export default async function CmsContactPage() {
  if (!isCmsConfigured()) {
    return <NotConfiguredBanner title="Contact details aren't ready yet" />;
  }

  const contact = await getContactForAdmin();

  return (
    <div>
      <h1 className="text-h2 text-strong">Contact details</h1>
      <p className="mt-2 max-w-2xl text-small leading-relaxed text-muted">
        The email, phone number, address and hours shown across the website — in the header,
        footer, and every page that invites someone to get in touch.
      </p>

      <div className="mt-8">
        <ContactForm initialContact={contact} />
      </div>
    </div>
  );
}
