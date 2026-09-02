import { z } from 'zod';

/**
 * Typed environment configuration.
 *
 * Read once, here. Nothing else in the codebase touches `process.env`, so the
 * set of variables the site depends on is visible in a single file and every
 * consumer gets a validated, correctly typed value.
 */

/**
 * Reads a variable, treating an empty or whitespace-only value as unset.
 *
 * Hosting platforms routinely expose a declared-but-blank variable as an empty
 * string rather than leaving it undefined, and a Zod `.default()` only applies
 * to `undefined`. Without this, a blank value on the host fails validation and
 * takes the whole build down, which is exactly what happened on the first
 * deployment.
 */
function read(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * The environment this deployment represents, when nothing says otherwise.
 *
 * Deliberately fail-closed: any production build is assumed to be production
 * unless told otherwise, so an unconfigured deployment serves the Coming Soon
 * page rather than publishing an unapproved site. Development and test keep
 * the full site, which is what local work needs.
 */
function defaultAppEnv(): 'development' | 'production' {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => (typeof value === 'boolean' ? value : value.trim().toLowerCase() === 'true'));

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://trustbridgeimmigration.co.uk'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default(defaultAppEnv),

  SITE_LAUNCHED: booleanFromString.default(false),

  FEATURE_COMPLEX_MATTERS: booleanFromString.default(false),
  FEATURE_BUSINESS_IMMIGRATION: booleanFromString.default(false),

  PREVIEW_SECRET: z.string().optional(),

  /**
   * Enquiry delivery. There is no database: a submission either sends
   * successfully or the visitor is told to email or call directly, so both
   * the inbox and the sending identity are validated as ordinary strings
   * rather than left to fail inside the Resend call.
   */
  ENQUIRY_INBOX: z.email().default('info@trustbridgeimmigration.co.uk'),
  ENQUIRY_FROM_EMAIL: z.email().default('enquiries@trustbridgeimmigration.co.uk'),
  RESEND_API_KEY: z.string().optional(),

  /** Google reCAPTCHA v2 (checkbox). Both keys come from the same site registration. */
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),

  /**
   * The Calendly event type to embed on /book, e.g.
   * https://calendly.com/trustbridge/consultation. Public: it only names
   * which public booking page to show, nothing secret. Left unset, the page
   * falls back to an honest "email or call us" placeholder.
   */
  NEXT_PUBLIC_CALENDLY_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function readEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: read(process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_APP_ENV: read(process.env.NEXT_PUBLIC_APP_ENV),
    SITE_LAUNCHED: read(process.env.SITE_LAUNCHED),
    FEATURE_COMPLEX_MATTERS: read(process.env.FEATURE_COMPLEX_MATTERS),
    FEATURE_BUSINESS_IMMIGRATION: read(process.env.FEATURE_BUSINESS_IMMIGRATION),
    PREVIEW_SECRET: read(process.env.PREVIEW_SECRET),
    ENQUIRY_INBOX: read(process.env.ENQUIRY_INBOX),
    ENQUIRY_FROM_EMAIL: read(process.env.ENQUIRY_FROM_EMAIL),
    RESEND_API_KEY: read(process.env.RESEND_API_KEY),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: read(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
    RECAPTCHA_SECRET_KEY: read(process.env.RECAPTCHA_SECRET_KEY),
    NEXT_PUBLIC_CALENDLY_URL: read(process.env.NEXT_PUBLIC_CALENDLY_URL),
  });

  if (!parsed.success) {
    // Fail loudly. A misread launch flag is the single most costly failure
    // this site can have, so an invalid environment must never boot silently.
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env: Env = readEnv();

/** True once both Resend and reCAPTCHA are configured and the form can actually send. */
export function isEnquiryDeliveryConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.RECAPTCHA_SECRET_KEY && env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
}
