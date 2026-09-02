import { describe, expect, it } from 'vitest';
import { collectFieldErrors, enquirySchema, isHoneypotFilled } from '@/lib/validation/enquiry';

/**
 * Enquiry validation.
 *
 * The same schema runs in the browser and in the route handler, so these tests
 * cover both. Unhappy paths matter more than the happy one here: the consent
 * checkbox is a GDPR requirement and the honeypot is the site's only current
 * spam defence.
 */

const VALID = {
  fullName: 'Amina Yusuf',
  email: 'Amina.Yusuf@Example.com',
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

describe('enquiry schema', () => {
  it('accepts a complete, valid submission', () => {
    const result = enquirySchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('normalises the email address to lower case', () => {
    const result = enquirySchema.parse(VALID);
    expect(result.email).toBe('amina.yusuf@example.com');
  });

  it('trims surrounding whitespace from text fields', () => {
    const result = enquirySchema.parse({ ...VALID, fullName: '  Amina Yusuf  ' });
    expect(result.fullName).toBe('Amina Yusuf');
  });

  it('rejects a submission without consent', () => {
    const result = enquirySchema.safeParse({ ...VALID, consent: false });
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(collectFieldErrors(result.error).consent).toMatch(/confirm you have read/i);
    }
  });

  it('rejects a missing consent field entirely', () => {
    const { consent: _consent, ...withoutConsent } = VALID;
    expect(enquirySchema.safeParse(withoutConsent).success).toBe(false);
  });

  it.each([
    ['empty', ''],
    ['no domain', 'someone@'],
    ['no at sign', 'someone.example.com'],
    ['spaces only', '   '],
  ])('rejects an invalid email (%s)', (_label, email) => {
    expect(enquirySchema.safeParse({ ...VALID, email }).success).toBe(false);
  });

  it.each([
    ['letters', 'not a phone'],
    ['too short', '123'],
    ['empty', ''],
  ])('rejects an invalid telephone (%s)', (_label, telephone) => {
    expect(enquirySchema.safeParse({ ...VALID, telephone }).success).toBe(false);
  });

  it('accepts international telephone formats', () => {
    for (const telephone of ['+44 7417 487423', '(020) 7946 0958', '+234-801-234-5678']) {
      expect(enquirySchema.safeParse({ ...VALID, telephone }).success).toBe(true);
    }
  });

  it('rejects a description that is too short to be useful', () => {
    expect(enquirySchema.safeParse({ ...VALID, description: 'Help' }).success).toBe(false);
  });

  it('rejects a description beyond the maximum length', () => {
    expect(enquirySchema.safeParse({ ...VALID, description: 'a'.repeat(3001) }).success).toBe(false);
  });

  it('rejects an enquiry type outside the published list', () => {
    expect(enquirySchema.safeParse({ ...VALID, enquiryType: 'Asylum claim' }).success).toBe(false);
  });

  it('rejects a contact preference outside the published list', () => {
    expect(enquirySchema.safeParse({ ...VALID, contactPreference: 'Carrier pigeon' }).success).toBe(
      false,
    );
  });

  it('does not fail validation on a filled honeypot', () => {
    // Failing here would return a field error naming the honeypot, which tells
    // a bot what caught it. Detection belongs in the route handler instead.
    expect(enquirySchema.safeParse({ ...VALID, website: 'http://spam.example' }).success).toBe(true);
  });

  it('detects a filled honeypot separately from validation', () => {
    expect(isHoneypotFilled({ website: 'http://spam.example' })).toBe(true);
    expect(isHoneypotFilled({ website: '   ' })).toBe(false);
    expect(isHoneypotFilled({ website: '' })).toBe(false);
  });

  it('rejects a submission with no reCAPTCHA token', () => {
    const result = enquirySchema.safeParse({ ...VALID, recaptchaToken: '' });
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(collectFieldErrors(result.error).recaptchaToken).toMatch(/not a robot/i);
    }
  });

  it('rejects a missing reCAPTCHA token entirely', () => {
    const { recaptchaToken: _recaptchaToken, ...withoutToken } = VALID;
    expect(enquirySchema.safeParse(withoutToken).success).toBe(false);
  });

  it('reports one error per field, in field order', () => {
    const result = enquirySchema.safeParse({
      ...VALID,
      fullName: '',
      email: 'nope',
      consent: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = collectFieldErrors(result.error);
      expect(Object.keys(errors)).toEqual(expect.arrayContaining(['fullName', 'email', 'consent']));
      expect(errors.fullName).toBeTypeOf('string');
    }
  });
});
