# TrustBridge Immigration Services Ltd: Website

A modern, premium website for a UK immigration services practice. Built with Next.js, with enquiries emailed directly to the shared inbox (no database) and a launch gate that keeps the full site private until the client approves go-live.

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
- **Content:** Bundled with the repository (`src/content`), edited as code. No CMS, no database — see Open Decisions.
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
  /resources          Articles (bundled content)
  /legal              Privacy, Cookies, T&Cs, Complaints, Regulatory, Accessibility
  /book               Consultation booking
  /coming-soon        Public placeholder (prod default until launch)
  /api/enquiry        Validates, checks reCAPTCHA, emails the enquiry via Resend
/components           CTA, ServiceCard, AdviserCard, ArticleCard, DisclaimerBlock, EnquiryForm, Recaptcha
/lib                  email, recaptcha, validation, feature-flags
/content              Bundled site content (services, articles, advisers, legal, pages)
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

There is no CMS. Articles, service pages and adviser profiles live in `src/content` as TypeScript and are edited by a developer, then published through the normal deploy process.

## Launch Checklist

- [ ] Client supplied regulatory details, adviser info, final services, wording
- [ ] Placeholders populated (regulatory info, complaints, adviser registration)
- [ ] Legal pages finalised
- [ ] `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` domain verification, and both reCAPTCHA keys are set in production
- [ ] A real enquiry has been sent end-to-end and arrived in `info@trustbridgeimmigration.co.uk`
- [ ] Lighthouse ≥ 90, WCAG 2.1 AA checks pass
- [ ] Client approval received → set `SITE_LAUNCHED=true`

## Handover Deliverables

Admin credentials · hosting/DNS access · email admin access (client-managed) · Resend account access · reCAPTCHA account access · paid licences list · recurring costs · renewal schedule.

## Open Decisions

1. Booking: Cal.com vs Calendly vs SimplyBook.me.
2. Whether a CMS (e.g. Payload) is worth adding later — it would let staff edit content without a developer, but needs a database and the hosting/backup/auth work that comes with one. Deferred for now.
3. Email platform for the mailboxes themselves: Google Workspace vs Microsoft 365 (client-managed, outside this repository).