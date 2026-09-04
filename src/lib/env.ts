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

  /**
   * The lightweight Resources CMS. Articles are stored in Upstash Redis
   * (provisioned from the Vercel Storage tab) and uploaded images in Vercel
   * Blob. Left unset, the admin area is disabled and the public site falls
   * back to the bundled sample articles read-only, rather than failing to
   * build or serving an empty Resources page.
   */
  KV_REST_API_URL: z.url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  /**
   * A single shared editor password, not per-user accounts: proportionate for
   * a three-person team editing articles, not a reason to add a full auth
   * system. ADMIN_SESSION_SECRET signs the session cookie so it cannot be
   * forged without both values.
   */
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),

  /**
   * Which article set the public Resources pages show.
   *
   * 'demo'  → the three bundled sample articles, regardless of what is in
   *           Redis. Lets the site be previewed and reviewed while the CMS is
   *           still being populated, without publishing half-finished drafts.
   * 'cms'   → the real, Redis-backed articles created through /admin.
   *
   * Defaults to 'demo' so a fresh deployment never shows an empty Resources
   * page before anyone has written anything in the admin. Flip it to 'cms'
   * when the practice is ready to go live with its own content.
   */
  RESOURCES_DATA_SOURCE: z.enum(['demo', 'cms']).default('demo'),
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
    KV_REST_API_URL: read(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN: read(process.env.KV_REST_API_TOKEN),
    BLOB_READ_WRITE_TOKEN: read(process.env.BLOB_READ_WRITE_TOKEN),
    ADMIN_PASSWORD: read(process.env.ADMIN_PASSWORD),
    ADMIN_SESSION_SECRET: read(process.env.ADMIN_SESSION_SECRET),
    RESOURCES_DATA_SOURCE: read(process.env.RESOURCES_DATA_SOURCE),
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

/** True once Redis is provisioned and articles can be read from/written to it. */
export function isCmsConfigured(): boolean {
  return Boolean(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
}

/** True once image uploads have somewhere to go. */
export function isBlobConfigured(): boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN);
}

/** True once the admin area can actually authenticate an editor. */
export function isAdminAuthConfigured(): boolean {
  return Boolean(env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET);
}
