# Implementation Plan
## TrustBridge Immigration Services Ltd: Website

**Stack decision:** Next.js + headless CMS · secured DB + email · balanced priority (fast-to-launch gate, robust build behind it).

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS | SSG/ISR marketing pages, mobile-first, premium |
| CMS | **Payload CMS** (self-hosted, Postgres-native): Sanity as alternative | §10 ownership; data stays in-house. Sanity if easiest editing wins |
| Enquiry API | Next.js Route Handlers (or small NestJS service) | Validation, encryption, DB write, email dispatch |
| Database | PostgreSQL | Enquiries encrypted at rest |
| Transactional email | Resend / Postmark / AWS SES | Reliable form → mailbox delivery; SPF/DKIM/DMARC |
| Shared mailbox | Google Workspace or Microsoft 365 | Shared `info@`, sent items visible, no duplicate replies |
| Booking | Cal.com (self-hosted) or Calendly/SimplyBook.me | Ownership vs speed |
| Hosting | Vercel (frontend) + managed Postgres (Supabase/Neon/Railway) or single VPS | Balance of DX and control |
| Auth (admin) | CMS auth + 2FA | Least-privilege roles |

## Environments

- **dev**: local.
- **staging**: password-protected, full site visible for client review.
- **production**: shows only Coming Soon until launch flag flipped.

`SITE_LAUNCHED` env flag / feature flag gates the full site vs Coming Soon on production.

---

## Phased Delivery (≈8 weeks)

### Phase 0: Foundations & Coming Soon (Week 1)
- Repo, Next.js + TS + Tailwind scaffold, CI/CD, three environments.
- **Deploy Coming Soon to live domain immediately** (HTTPS, the two contact lines only).
- Domain/DNS, SSL, email hosting + shared mailbox, SPF/DKIM/DMARC.
- Launch feature flag wired.

### Phase 1: Design System & Core Pages (Weeks 2-3)
- Design tokens (navy + stone + gold), typography, component library.
- Home, About Us, Contact: responsive.
- Reusable CTA components + reusable outcome-disclaimer block.

### Phase 2: Modular Services Architecture (Weeks 3-4)
- Single service-page template → per-route pages.
- Services index auto-listing from CMS (add category → no redesign).
- Complex Matters section built, **flag-disabled**.

### Phase 3: CMS & Resources (Weeks 4-5)
- Payload/Sanity setup; Articles with categories, SEO, draft/publish, admin editing.
- Adviser-profile model (name, title, regulatory level, registration no.): built empty.

### Phase 4: Enquiry Form, DB & Booking (Weeks 5-6)
- Secure form with specified fields + GDPR consent.
- Validation, spam protection (honeypot + CAPTCHA), rate limiting.
- Encrypted Postgres store + email to shared mailbox.
- Admin submissions view with delete/erasure + retention purge job.
- Booking integration.

### Phase 5: Regulatory, Legal & Hardening (Weeks 6-7)
- Placeholder legal/regulatory pages (structure live, wording later). **No fabricated badge.**
- Cookie-consent banner with granular controls.
- Security pass: admin 2FA, roles, backups, dependency updates, CSP/HSTS headers.

### Phase 6: Pre-Launch & Handover (Weeks 7-8)
- Client supplies regulatory details, adviser info, final services, wording → populate.
- Full QA, mobile testing, Lighthouse + accessibility audit.
- Handover pack (§10 deliverables).
- Client approval → flip launch flag → site public.

---

## Enquiry Data Model (Postgres)

```
enquiries
  id            uuid pk
  full_name     text            (encrypted)
  email         text            (encrypted)
  telephone     text            (encrypted)
  country       text
  nationality   text
  enquiry_type  text
  description    text           (encrypted)
  contact_pref  text
  consent       boolean not null
  created_at    timestamptz
  status        enum(new, in_progress, handled)
  purge_after   timestamptz     (retention)
```

- Encrypt PII columns at rest (pgcrypto or app-layer AES-GCM with KMS-held key).
- Retention job purges rows past `purge_after`.
- Admin actions: view, mark handled, delete (erasure), export (DSAR).

## Email / Shared Mailbox Configuration (advice for client)

- Use a **shared mailbox** on Google Workspace or Microsoft 365 (not simple forwarding): authorised team members receive, access, reply, and see sent items: avoiding duplicate responses.
- Transactional sender delivers form submissions to `info@`; configure SPF, DKIM, DMARC for deliverability and anti-spoofing.

## Security Checklist

- [ ] HTTPS + HSTS everywhere
- [ ] PII encrypted at rest
- [ ] Admin 2FA + least-privilege roles
- [ ] Honeypot + CAPTCHA + rate limiting on forms
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Automated backups + tested restore
- [ ] Dependency/patch update cadence
- [ ] Documented retention + DSAR/erasure process
- [ ] Cookie consent with granular controls

## Handover Pack

Admin credentials · hosting/DNS · email admin · backup info · paid licences list · recurring costs · renewal schedule. Domain + data owned by TrustBridge.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Accidental early publication | Launch flag defaults closed; Coming Soon on prod |
| Storing sensitive PII (GDPR) | Encryption, retention, erasure, minimisation |
| Implying guaranteed outcomes | Reusable disclaimer; copy review |
| Premature regulatory claim | No badge until client supplies wording |
| Scope creep on services | Confirm final services pre-launch |