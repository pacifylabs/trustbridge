# TrustBridge Immigration Services Ltd: Website

A modern, premium website for a UK immigration services practice. Built with Next.js + a headless CMS, with secure enquiry handling (encrypted DB + email) and a launch gate that keeps the full site private until the client approves go-live.

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
- **CMS:** Payload CMS (self-hosted, Postgres): or Sanity (alternative)
- **Database:** PostgreSQL (enquiry PII encrypted at rest)
- **Email:** Resend/Postmark/SES (transactional) + Google Workspace / M365 shared mailbox (`info@`)
- **Booking:** Cal.com (self-hosted) or Calendly/SimplyBook.me
- **Hosting:** Vercel + managed Postgres (or single VPS)

## Project Structure (indicative)

```
/app
  /(marketing)        Home, About, Contact
  /services           Index + [slug] modular route pages
  /team               Adviser profiles
  /resources          Articles (CMS)
  /legal              Privacy, Cookies, T&Cs, Complaints, Regulatory, Accessibility
  /book               Consultation booking
  /coming-soon        Public placeholder (prod default until launch)
/components           CTA, ServiceCard, AdviserCard, ArticleCard, DisclaimerBlock, EnquiryForm
/lib                  db, encryption, email, validation, feature-flags
/cms                  Payload config + collections
/styles               design tokens
```

## Environment Variables

```
DATABASE_URL=
SITE_LAUNCHED=false            # gate: false → Coming Soon on prod
ENQUIRY_INBOX=info@trustbridgeimmigration.co.uk
EMAIL_API_KEY=
ENCRYPTION_KEY=                # KMS-managed; encrypts enquiry PII
CAPTCHA_SECRET=
CMS_SECRET=
FEATURE_COMPLEX_MATTERS=false
FEATURE_BUSINESS_IMMIGRATION=false
```

## Getting Started

```bash
pnpm install
cp .env.example .env          # fill values
pnpm db:migrate
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
- Spam protection (honeypot + CAPTCHA) + rate limiting.
- On submit: encrypted store in Postgres **and** email to shared mailbox.
- Admin: view, mark handled, delete (erasure). Retention purge job runs on schedule.

## Content Editing (no developer needed)

Articles and adviser profiles are managed in the CMS admin. Staff can add/edit/publish without code.

## Launch Checklist

- [ ] Client supplied regulatory details, adviser info, final services, wording
- [ ] Placeholders populated (regulatory info, complaints, adviser registration)
- [ ] Legal pages finalised
- [ ] Security pass (2FA, headers, backups) complete
- [ ] Lighthouse ≥ 90, WCAG 2.1 AA checks pass
- [ ] Client approval received → set `SITE_LAUNCHED=true`

## Handover Deliverables

Admin credentials · hosting/DNS access · email admin access · backup details · paid licences list · recurring costs · renewal schedule.

## Open Decisions

1. CMS: Payload vs Sanity  2. Booking: Cal.com vs Calendly  3. Enquiry retention period  4. Email: Google Workspace vs M365.