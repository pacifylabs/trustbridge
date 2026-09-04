import { unstable_cache } from 'next/cache';
import { redis } from './redis';
import { phoneToHref, splitAddressLines, type ContactInput } from '@/lib/validation/contact';
import { CONTACT } from '@/content/site';

/**
 * Contact details (single document, no list — mirrors lib/cms/settings.ts).
 *
 * Falls back to the bundled CONTACT constant whenever Redis has nothing at
 * all (unconfigured or never written), the same "real content is the safety
 * net" pattern used for services — this is the phone number and email
 * printed across the whole site, so it must never render blank.
 */

const CONTACT_KEY = 'cms:contact';
const CACHE_TAG = 'cms-contact';

export interface ContactInfo {
  readonly email: string;
  readonly phone: string;
  readonly phoneHref: string;
  readonly addressLines: readonly string[];
  readonly hours: string;
}

function defaults(): ContactInfo {
  return {
    email: CONTACT.email,
    phone: CONTACT.phone,
    phoneHref: CONTACT.phoneHref,
    addressLines: CONTACT.address.lines,
    hours: CONTACT.hours.value,
  };
}

async function readContactUncached(): Promise<ContactInfo> {
  if (!redis) return defaults();
  try {
    const stored = await redis.get<ContactInput>(CONTACT_KEY);
    if (!stored) return defaults();
    return {
      email: stored.email,
      phone: stored.phone,
      phoneHref: phoneToHref(stored.phone),
      addressLines: splitAddressLines(stored.address),
      hours: stored.hours ?? '',
    };
  } catch {
    return defaults();
  }
}

export const getContactInfo = unstable_cache(readContactUncached, ['cms-contact-v1'], {
  tags: [CACHE_TAG],
  revalidate: 30,
});

export async function getContactForAdmin(): Promise<ContactInput> {
  if (!redis) {
    return { email: CONTACT.email, phone: CONTACT.phone, address: '', hours: CONTACT.hours.value };
  }
  const stored = await redis.get<ContactInput>(CONTACT_KEY);
  return (
    stored ?? { email: CONTACT.email, phone: CONTACT.phone, address: '', hours: CONTACT.hours.value }
  );
}

export async function updateContactInfo(input: ContactInput): Promise<void> {
  if (!redis) {
    throw new Error('Contact details are not configured: set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  await redis.set(CONTACT_KEY, input);
}
