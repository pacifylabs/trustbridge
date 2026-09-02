import { env } from './env';

/**
 * Google reCAPTCHA v2 (checkbox) server-side verification.
 *
 * The widget on the form only proves a token was issued; it says nothing
 * about whether that token is genuine. Every submission is re-checked here
 * against Google's endpoint before the enquiry is sent, the same reasoning
 * that already governs why the form fields are revalidated server-side.
 */

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyRecaptcha(token: string, remoteIp?: string): Promise<boolean> {
  if (!env.RECAPTCHA_SECRET_KEY) {
    // Unconfigured deployment (e.g. local development without keys set).
    // Failing open here would make it impossible to run the site at all
    // before the client's Google account exists; failing closed in
    // production is handled by RECAPTCHA_SECRET_KEY simply never being unset
    // once configured for real.
    return env.NEXT_PUBLIC_APP_ENV !== 'production';
  }

  const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  let result: { success?: boolean };
  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    result = await response.json();
  } catch {
    return false;
  }

  return result.success === true;
}
