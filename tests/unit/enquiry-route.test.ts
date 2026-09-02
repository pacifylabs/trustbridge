import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/enquiry/route';

/**
 * Enquiry route handler.
 *
 * The client validates for convenience; the server validates because anything
 * arriving over the network is untrusted. These tests exercise the server side
 * directly, bypassing the form entirely. Email delivery and reCAPTCHA
 * verification are mocked: what matters here is that the route calls them
 * correctly and reports their outcome honestly, not Resend's or Google's
 * actual behaviour.
 */

const { verifyRecaptcha, sendEnquiryEmail } = vi.hoisted(() => ({
  verifyRecaptcha: vi.fn(),
  sendEnquiryEmail: vi.fn(),
}));

vi.mock('@/lib/recaptcha', () => ({ verifyRecaptcha }));
vi.mock('@/lib/email', () => ({ sendEnquiryEmail }));

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
  recaptchaToken: 'a-valid-token',
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

beforeEach(() => {
  verifyRecaptcha.mockReset().mockResolvedValue(true);
  sendEnquiryEmail.mockReset().mockResolvedValue({ ok: true });
});

describe('POST /api/enquiry', () => {
  it('accepts a valid submission and sends it by email', async () => {
    const response = await post(VALID);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toMatch(/received/i);
    expect(sendEnquiryEmail).toHaveBeenCalledTimes(1);
  });

  it('verifies the reCAPTCHA token before sending', async () => {
    await post(VALID);
    expect(verifyRecaptcha).toHaveBeenCalledWith('a-valid-token', undefined);
  });

  it('rejects a submission that fails reCAPTCHA verification, without sending', async () => {
    verifyRecaptcha.mockResolvedValue(false);

    const response = await post(VALID);
    expect(response.status).toBe(422);

    const body = await response.json();
    expect(body.fieldErrors.recaptchaToken).toBeTruthy();
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it('reports delivery failure honestly rather than claiming success', async () => {
    sendEnquiryEmail.mockResolvedValue({ ok: false, error: 'Resend rejected the request.' });

    const response = await post(VALID);
    expect(response.status).toBe(502);

    const body = await response.json();
    expect(body.message).toMatch(/email or call us directly/i);
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

  it('silently accepts a filled honeypot without revealing the trap, and does not send', async () => {
    const response = await post({ ...VALID, website: 'http://spam.example' });

    // A 422 would tell a bot which field gave it away, so this returns 200.
    expect(response.status).toBe(200);
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
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
