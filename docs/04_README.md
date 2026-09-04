# TrustBridge Immigration Services Ltd: Website

A modern, premium website for a UK immigration services practice. Built with Next.js, with enquiries emailed directly to the shared inbox (no database involved in that path), a lightweight self-service CMS for Resources articles, and a launch gate that keeps the full site private until the client approves go-live.

> **Trust · Clarity · Professionalism**

---

## ⚠️ Critical Rules (read before building)

1. **Never** state or imply that a visa or immigration application is guaranteed to succeed.
2. **Never** display a regulatory logo, badge, or claim of regulation until the client supplies final regulatory wording.
3. The **full site must stay unpublished** until the client gives explicit launch approval. Production shows only the Coming Soon page until the `SITE_LAUNCHED` flag is enabled.
4. **Complex Immigration Matters** and specific **Business Immigration** services are feature-flagged OFF until regulatory authorisation is confirmed.
5. Domain, website, and data remain owned and controlled by **TrustBridge Immigration Services Ltd**.
6. Confirm with the client before assuming any regulatory wording, service list, or adviser status.

---

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Content:** Services, adviser profiles and legal pages are bundled with the repository (`src/content`), edited as code. Articles have their own lightweight CMS instead — see Resources CMS below.
- **Resources CMS:** `/cms`, a password-gated CMS area backed by Upstash Redis (article data) and Vercel Blob (uploaded images)
- **Email:** Resend (transactional) → Google Workspace / M365 shared mailbox (`info@`), which the client manages directly
- **Spam protection:** Honeypot field + Google reCAPTCHA v2 (checkbox)
- **Booking:** Calendly, embedded on `/book` behind a click-to-load gate (see below)
- **Hosting:** Vercel

## Project Structure (indicative)

```
/app
  /(marketing)        Home, About, Contact
  /services           Index + [slug] modular route pages
  /team               Adviser profiles
  /resources          Articles (read from the Resources CMS)
  /legal              Privacy, Cookies, T&Cs, Complaints, Regulatory, Accessibility
  /book               Consultation booking
  /coming-soon        Public placeholder (prod default until launch)
  /cms                Resources CMS: login + article list/editor, password-gated
  /api/enquiry        Validates, checks reCAPTCHA, emails the enquiry via Resend
  /api/cms            Article CRUD, image upload, login/logout — all session-gated
/components           CTA, ServiceCard, AdviserCard, ArticleCard, DisclaimerBlock, EnquiryForm, Recaptcha
/components/cms       ArticleForm, ArticlesList, LoginForm
/lib                  email, recaptcha, validation, feature-flags
/lib/cms              Redis-backed article storage, Blob uploads, admin session signing
/content              Bundled site content (services, advisers, legal, pages; article samples for seeding)
/styles               design tokens
```

## Environment Variables

```
SITE_LAUNCHED=false            # gate: false → Coming Soon on prod
ENQUIRY_INBOX=info@trustbridgeimmigration.co.uk
ENQUIRY_FROM_EMAIL=enquiries@trustbridgeimmigration.co.uk   # must be a Resend-verified domain
RESEND_API_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
NEXT_PUBLIC_CALENDLY_URL=      # e.g. https://calendly.com/trustbridge/consultation
KV_REST_API_URL=               # Upstash Redis, via Vercel Storage
KV_REST_API_TOKEN=
BLOB_READ_WRITE_TOKEN=         # Vercel Blob, via Vercel Storage
ADMIN_PASSWORD=                # shared /cms editor password
ADMIN_SESSION_SECRET=          # e.g. `openssl rand -base64 32`
RESOURCES_DATA_SOURCE=demo     # demo | cms — see Content Editing
FEATURE_COMPLEX_MATTERS=false
FEATURE_BUSINESS_IMMIGRATION=false
```

## Getting Started

```bash
pnpm install
cp .env.example .env          # fill values
pnpm dev                       # http://localhost:3000
```

## Environments

| Env | Visibility |
|---|---|
| dev | local |
| staging | password-protected, full site for client review |
| production | Coming Soon only until `SITE_LAUNCHED=true` |

## Enquiry Handling

- Fields: Full Name, Email, Telephone, Country of Residence, Nationality, Enquiry Type, Description, Preferred Contact + **consent checkbox**.
- Spam protection: honeypot field + Google reCAPTCHA v2, both checked server-side.
- On submit: emailed directly to the shared inbox via Resend. **Nothing is stored anywhere else** — there is no database, so a submission that fails to send is gone; the visitor is told plainly to email or call instead.
- No admin submissions view, retention job, or erasure tooling exists, because nothing is retained by the site itself.

## Content Editing

Service pages, adviser profiles and legal pages live in `src/content` as TypeScript and are edited by a developer, then published through the normal deploy process.

Articles are different: staff sign in at `/cms` (shared password) to add, edit and remove Resources articles themselves, no developer or deploy required. A save calls `revalidatePath`, so the change is live within seconds rather than waiting on a rebuild. Uploaded images go to Vercel Blob; article data is stored in Upstash Redis. Until both are provisioned (see Environment Variables), `/cms` shows a clear "not configured" message and the public Resources page falls back to the three sample articles bundled in `src/content/articles.ts`, read-only. Once Redis is live and empty, the CMS's "Import starter content" button loads those same three samples as real, editable articles.

**Demo vs live content.** `RESOURCES_DATA_SOURCE` decides what the public Resources page actually shows, independent of what is sitting in the CMS: `demo` (the default) always shows the three bundled sample articles, even in production, so the site can be reviewed and previewed while real articles are still being drafted in `/cms` — visitors never see half-finished content. Setting it to `cms` switches the public page over to whatever is published in Redis. The admin article list shows a banner whenever it is not `cms`, so it is never a surprise that an edit made in `/cms` is not appearing on the live page.

## Launch Checklist

- [ ] Client supplied regulatory details, adviser info, final services, wording
- [ ] Placeholders populated (regulatory info, complaints, adviser registration)
- [ ] Legal pages finalised
- [ ] `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` domain verification, and both reCAPTCHA keys are set in production
- [ ] A real enquiry has been sent end-to-end and arrived in `info@trustbridgeimmigration.co.uk`
- [ ] Redis and Blob provisioned, `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` set, and a real article created and edited end-to-end through `/cms`
- [ ] Lighthouse ≥ 90, WCAG 2.1 AA checks pass
- [ ] Client approval received → set `SITE_LAUNCHED=true`

## Handover Deliverables

Admin credentials · hosting/DNS access · email admin access (client-managed) · Resend account access · reCAPTCHA account access · Vercel Storage (Redis + Blob) access · `/cms` password · paid licences list · recurring costs · renewal schedule.

## Open Decisions

1. Email platform for the mailboxes themselves: Google Workspace vs Microsoft 365 (client-managed, outside this repository).
2. Whether the Resources CMS should grow beyond articles (e.g. adviser profiles) — deliberately kept narrow for now, since regulatory wording and adviser credentials arguably should not be freely editable without review.