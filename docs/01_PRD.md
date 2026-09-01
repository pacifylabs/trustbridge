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
- Enable client self-editing of articles/resources without developer involvement.
- Capture enquiries securely (sensitive personal data) with GDPR consent.
- Integrate online consultation booking.
- Provide a modular, future-proof architecture (add services/advisers/articles without redesign).
- Deliver full ownership and admin control to the client at handover.

### Non-Goals (for v1)
- No client portal / case-management system.
- No online payments.
- No automated immigration decisioning or outcome prediction.
- No live regulatory badge until wording is confirmed by client.

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
- **Resources / Immigration Updates**: CMS-managed articles, admin-editable.
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
- Server-side validation + spam protection (honeypot + CAPTCHA) + rate limiting.
- On submit: **encrypted store in Postgres AND email to info@trustbridgeimmigration.co.uk.**
- Admin can view submissions, mark handled, and delete (right-to-erasure).
- Retention policy: auto-purge after configurable period (default suggestion: 12 months: CONFIRM with client).

### 6.2 CMS / Resources
- Admin creates/edits/publishes articles with categories, SEO metadata, draft/publish states.
- No developer needed for content changes.

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

- **Security:** HTTPS/HSTS throughout, encrypted enquiry data at rest, secure admin auth with 2FA, least-privilege roles, security headers (CSP), dependency updates, automated backups.
- **Privacy/GDPR:** granular cookie consent, data-minimisation, documented retention, DSAR/erasure support.
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

1. CMS: Payload (self-hosted, max ownership) vs Sanity (easiest editing).
2. Booking tool: self-hosted Cal.com vs hosted Calendly.
3. Enquiry retention period.
4. Email platform: Google Workspace vs Microsoft 365 (shared mailbox on either).

## 10. Handover Deliverables

Admin credentials · hosting/DNS access · email admin access · backup details · list of paid themes/plugins/licences · recurring costs · renewal schedule.

## 11. Success Criteria

- Client can add an article and an adviser profile unaided.
- Enquiry submits, stores encrypted, and arrives in shared mailbox.
- No page implies guaranteed outcomes; no unconfirmed regulatory claim appears.
- Coming Soon live on domain until approval; full site launches only on client sign-off.