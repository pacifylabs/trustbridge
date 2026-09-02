# Product Requirements Document (PRD)
## TrustBridge Immigration Services Ltd: Website

**Version:** 1.0 (Draft)
**Status:** Pre-launch build. Full site must remain unpublished until client gives explicit launch approval.
**Owner:** TrustBridge Immigration Services Ltd
**Company Number:** 17399361 (England and Wales)

---

## 1. Purpose

Build a modern, premium, professional website for a UK immigration services practice. The site must convey **Trust, Clarity, and Professionalism**, avoid the look of a generic visa agency, and be architected to grow as services and advisers expand.

Critically, this is a **regulated professional services** context. The site must:
- Never suggest a visa or application is guaranteed to succeed.
- Never display an unofficial/fabricated regulatory logo, badge, or claim of regulation before final regulatory information is supplied.
- Keep the full operational site private until launch is approved; show only a Coming Soon page publicly in the interim.

## 2. Goals & Non-Goals

### Goals
- Present immigration services clearly across defined categories.
- Capture enquiries with GDPR consent and deliver them reliably to the shared inbox.
- Integrate online consultation booking.
- Provide a modular, future-proof architecture (add services/advisers/articles without redesign).
- Deliver full ownership and admin control to the client at handover.

### Non-Goals (for v1)
- No client portal / case-management system.
- No online payments.
- No automated immigration decisioning or outcome prediction.
- No live regulatory badge until wording is confirmed by client.
- **No database and no CMS.** At the client's direction, enquiries go to email only — nothing is persisted anywhere by the site — and content is edited as code rather than through an admin UI. Self-editing without a developer is deferred until a database is in scope (see §9).

## 3. Users

| Persona | Needs |
|---|---|
| Prospective client (individual/family) | Understand routes, assess eligibility, contact/book easily, feel reassured |
| Business client (employer) | Sponsor licence & compliance info, credible business-immigration presentation |
| Site administrator (TrustBridge staff) | Add/edit articles, manage adviser profiles, view enquiries, no code required |
| Immigration adviser | Accurate profile with regulatory level; enquiries routed to shared mailbox |

## 4. Scope: Pages

- **Home**: overview, principal services, key benefits, CTAs (contact / book).
- **About Us**: background, values, approach, team.
- **Services (index)**: links to per-category service pages.
- **Service pages (modular, per route):** Spouse & Partner, Visitor, Skilled Worker, Health & Care Worker, Settlement/ILR, British Citizenship, EU Settlement Scheme, Business Immigration.
- **Complex Immigration Matters**: BUILT BUT DISABLED (feature-flagged) until regulatory authorisation confirmed.
- **Our Team**: adviser profiles with regulatory-level fields (populated at launch).
- **Resources / Immigration Updates**: Articles bundled with the repository and developer-edited (no CMS in v1).
- **Contact Us**: phone, email, enquiry form.
- **Book a Consultation**: booking integration.
- **Regulatory & Legal**: Privacy Policy, Cookie Policy, Terms & Conditions, Complaints Procedure, Regulatory Information, Accessibility. Structure live; final wording slotted in later.

## 5. Service Categories (content model)

Family & Partner · Visitor · Work · Business (capacity, flag-gated) · Settlement · British Citizenship · EU Settlement Scheme · Immigration Status & Application Support · Complex Matters (flag-gated).

Final publicly-available services confirmed pre-launch based on regulatory authorisation held.

## 6. Functional Requirements

### 6.1 Enquiry Form
Fields: Full Name, Email, Telephone, Country of Residence, Nationality, Type of Immigration Enquiry, Brief Description, Preferred Method of Contact.
- Explicit privacy/consent acknowledgement (checkbox) required before submit.
- Server-side validation + spam protection (honeypot + Google reCAPTCHA v2, verified server-side).
- On submit: **emailed via Resend to info@trustbridgeimmigration.co.uk. Nothing is stored anywhere else** — there is no database, so a failed send is reported to the visitor rather than silently lost.
- No admin submissions view, retention job, or erasure tooling: with nothing persisted by the site, there is nothing to view or purge.

### 6.2 Content / Resources
- Articles, service pages and adviser profiles are bundled with the repository (`src/content`) and edited as code by a developer, then published through the normal deploy process.
- No CMS in v1, at the client's direction — see §9.

### 6.3 Adviser Profiles
- Content model with: name, professional title, regulatory level, registration number, bio, photo, linked services. Built empty; populated at launch.

### 6.4 Booking
- Embedded consultation booking (Cal.com self-hosted preferred for ownership, or Calendly/SimplyBook.me).

### 6.5 Calls to Action
Reusable CTA components: "Book a Consultation", "Speak to an Immigration Adviser", "Make an Enquiry", "Contact TrustBridge".
- No aggressive marketing; no outcome guarantees. A shared **outcome-disclaimer** component appears on service pages.

### 6.6 Launch Gate
- Env/feature flag controls public visibility. Production shows Coming Soon; full site on password-protected staging until approval.

## 7. Non-Functional Requirements

- **Security:** HTTPS/HSTS throughout, security headers (CSP), dependency updates. No enquiry data at rest to encrypt or back up — see §6.1.
- **Privacy/GDPR:** data-minimisation (nothing retained beyond the outgoing email); cookie consent only if a future feature actually sets non-essential cookies (none does today).
- **Performance:** SSG/ISR for marketing pages; Lighthouse ≥ 90 across the board.
- **Accessibility:** target WCAG 2.1 AA.
- **Responsive:** mobile-first; excellent on phones.
- **SEO:** semantic markup, metadata, sitemap, structured data for services/articles.

## 8. Constraints & Compliance Rules (hard)

1. Never state or imply guaranteed immigration outcomes.
2. No regulatory badge/claim until client supplies final wording.
3. Full site stays unpublished until explicit launch approval.
4. Complex Matters + Business Immigration specifics gated on regulatory authorisation.
5. Domain, site, and data remain owned/controlled by TrustBridge.
6. Consult client before assuming any regulatory wording, service, or adviser status.

## 9. Open Decisions (confirm with client)

1. Booking tool: self-hosted Cal.com vs hosted Calendly vs SimplyBook.me.
2. CMS: not built in v1, at the client's direction — content is edited as code. Worth revisiting once a database is in scope, so staff can self-edit without a developer.
3. Email platform for the mailboxes themselves: Google Workspace vs Microsoft 365 — client-managed, outside this repository.

## 10. Handover Deliverables

Admin credentials · hosting/DNS access · email admin access · backup details · list of paid themes/plugins/licences · recurring costs · renewal schedule.

## 11. Success Criteria

- Enquiry submits, passes reCAPTCHA, and arrives by email in the shared mailbox.
- No page implies guaranteed outcomes; no unconfirmed regulatory claim appears.
- Coming Soon live on domain until approval; full site launches only on client sign-off.