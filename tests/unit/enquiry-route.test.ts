import { describe, expect, it } from 'vitest';
import { POST, GET } from '@/app/api/enquiry/route';

/**
 * Enquiry route handler.
 *
 * The client validates for convenience; the server validates because anything
 * arriving over the network is untrusted. These tests exercise the server side
 * directly, bypassing the form entirely.
 */

const VALID = {
  fullName: 'Amina Yusuf',
  email: 'amina@example.com',
  telephone: '07417 487423',
  countryOfResidence: 'Nigeria',
  nationality: 'Nigerian',
  enquiryType: 'Spouse or partner visa',
  description: 'My husband is a British citizen and I would like to apply to join him in the UK.',
  contactPreference: 'Email',
  consent: true,
  website: '',
};

function post(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('POST /api/enquiry', () => {
  it('accepts a valid submission', async () => {
    const response = await post(VALID);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  it('reports honestly that nothing is persisted yet', async () => {
    // Phase 4 wires storage and email. Until then the response must not imply
    // the enquiry has reached the practice.
    const body = await (await post(VALID)).json();
    expect(body.persisted).toBe(false);
    expect(body.message).toMatch(/please also email or call us/i);
  });

  it('rejects a submission without consent', async () => {
    const response = await post({ ...VALID, consent: false });
    expect(response.status).toBe(422);

    const body = await response.json();
    expect(body.fieldErrors.consent).toBeTruthy();
  });

  it('revalidates server side even when the client would have passed it', async () => {
    const response = await post({ ...VALID, email: 'not-an-email' });
    expect(response.status).toBe(422);
    expect((await response.json()).fieldErrors.email).toBeTruthy();
  });

  it('returns field errors for every invalid field', async () => {
    const response = await post({ ...VALID, fullName: '', telephone: 'abc', description: 'no' });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(Object.keys(body.fieldErrors)).toEqual(
      expect.arrayContaining(['fullName', 'telephone', 'description']),
    );
  });

  it('rejects a malformed request body', async () => {
    const response = await POST(
      new Request('http://localhost/api/enquiry', { method: 'POST', body: 'not json' }),
    );
    expect(response.status).toBe(400);
  });

  it('silently accepts a filled honeypot without revealing the trap', async () => {
    const response = await post({ ...VALID, website: 'http://spam.example' });

    // A 422 would tell a bot which field gave it away, so this returns 200.
    expect(response.status).toBe(200);
  });

  it('does not echo the submitted personal data back in the response', async () => {
    const body = await (await post(VALID)).json();
    const serialised = JSON.stringify(body);

    expect(serialised).not.toContain('Amina');
    expect(serialised).not.toContain('amina@example.com');
    expect(serialised).not.toContain('07417');
  });
});

describe('GET /api/enquiry', () => {
  it('is not allowed', async () => {
    expect((await GET()).status).toBe(405);
  });
});
