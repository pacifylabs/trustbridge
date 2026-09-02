# Implementation Plan
## TrustBridge Immigration Services Ltd: Website

**Stack decision:** Next.js, no database · enquiries emailed directly via Resend · content bundled with the repository, no CMS.

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS | SSG/ISR marketing pages, mobile-first, premium |
| Content | Bundled with the repository (`src/content`), edited as code | No CMS: simplest option while the client is happy with developer-managed edits (see Open Decisions) |
| Enquiry API | Next.js Route Handler | Validation, reCAPTCHA verification, email dispatch. No database write — nothing is persisted |
| Transactional email | Resend | Enquiry → `info@` delivery; requires domain verification (SPF/DKIM/DMARC) in the Resend dashboard |
| Spam protection | Honeypot field + Google reCAPTCHA v2 (checkbox) | Both checked server-side before an email is sent |
| Shared mailbox | Google Workspace or Microsoft 365 (client-managed) | Shared `info@`, sent items visible, no duplicate replies. Client creates and administers the mailboxes directly |
| Booking | Not yet integrated | See Open Decisions |
| Hosting | Vercel | No database to host alongside it |

## Environments

- **dev**: local.
- **staging**: password-protected, full site visible for client review.
- **production**: shows only Coming Soon until launch flag flipped.

`SITE_LAUNCHED` env flag / feature flag gates the full site vs Coming Soon on production.

---

## Delivery Status

### Done
- Foundations: Next.js + TS + Tailwind, design system, core pages (Home, About, Contact, Team, Resources index).
- Modular services architecture: one template, per-route pages, Complex Matters and Business Immigration detail sections flag-gated.
- Launch gate (`SITE_LAUNCHED`, Coming Soon page, `noindex` while closed).
- Legal/regulatory page structure, with wording explicitly pending (no fabricated badge or claim).
- Enquiry form: full field set, GDPR consent checkbox, honeypot, and **working email delivery via Resend** — a submission is validated, checked against reCAPTCHA, and emailed straight to `info@trustbridgeimmigration.co.uk`. There is no database, so a failed send is reported to the visitor honestly rather than silently swallowed.
- Google reCAPTCHA v2 (checkbox), verified server-side on every submission.
- Security headers (HSTS, CSP, X-Frame-Options, etc.), including the CSP allowances reCAPTCHA needs.

### Not done / deferred
- **CMS.** Nothing was built beyond a stub interface, so nothing needed removing to change course. Content stays in `src/content`, edited by a developer. Worth revisiting once the client is ready to take on a database (see Open Decisions).
- **Booking integration.** The page explains how to arrange a consultation by email/phone in the meantime; no calendar is embedded.
- **Admin submissions view, retention/erasure tooling.** Not applicable without a database — there is nothing to view or purge.
- **Rate limiting on the enquiry endpoint.** reCAPTCHA is the primary defence at present; add rate limiting if abuse is observed.

## Email / Shared Mailbox Configuration (advice for client)

- Use a **shared mailbox** on Google Workspace or Microsoft 365 (not simple forwarding): authorised team members receive, access, reply, and see sent items, avoiding duplicate responses. The client manages this directly; it is outside the repository.
- The website's own outgoing mail (enquiry notifications) goes through **Resend**, from `ENQUIRY_FROM_EMAIL`, to `ENQUIRY_INBOX`. `ENQUIRY_FROM_EMAIL`'s domain must be verified in the Resend dashboard (SPF/DKIM/DMARC records) or sending will fail.

## reCAPTCHA Configuration

- Register the site at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) for reCAPTCHA **v2 (checkbox)**, listing every domain the form will be served from (production domain, staging domain, `localhost` for development).
- Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (public) and `RECAPTCHA_SECRET_KEY` (server-only). Without both, the widget does not render and the form skips reCAPTCHA validation entirely — treat them as required together, not independently optional.

## Security Checklist

- [x] HTTPS + HSTS everywhere
- [x] Security headers (CSP, X-Frame-Options, etc.)
- [x] Honeypot + reCAPTCHA on the enquiry form
- [ ] Rate limiting on the enquiry endpoint
- [ ] Admin 2FA on hosting/DNS/email/Resend/reCAPTCHA accounts (client-managed)
- [ ] Dependency/patch update cadence
- [ ] Cookie consent banner — not yet needed (no analytics or non-essential cookies are set); add one if that changes

## Handover Pack

Admin credentials · hosting/DNS · email admin (client-managed) · Resend account access · reCAPTCHA account access · paid licences list · recurring costs · renewal schedule. Domain + data owned by TrustBridge.

## Open Decisions

1. **Booking tool**: Cal.com (self-hosted) vs Calendly vs SimplyBook.me.
2. **CMS**: worth adding once a database is in scope — it would let staff edit content without a developer, at the cost of standing up Postgres, hosting, backups and admin auth. Deferred for now at the client's direction.
3. **Rate limiting**: whether reCAPTCHA alone is sufficient, or a request-rate limit should be added to the enquiry endpoint.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Accidental early publication | Launch flag defaults closed; Coming Soon on prod |
| Enquiry silently fails to send | No database to fall back on, so the route reports delivery failure to the visitor rather than claiming success |
| Implying guaranteed outcomes | Reusable disclaimer; copy review |
| Premature regulatory claim | No badge until client supplies wording |
| Scope creep on services | Confirm final services pre-launch |
