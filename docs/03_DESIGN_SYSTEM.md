# Design System
## TrustBridge Immigration Services Ltd

**Principles:** Trust · Clarity · Professionalism.
Modern, premium, professional: a UK professional-services firm, **not** a generic visa agency. Clean, contemporary, generous whitespace, clear typography, straightforward navigation, mobile-first.

---

## 1. Colour Palette

Chosen direction: **Navy primary + stone neutrals + muted gold accent.** Blue reads trustworthy; the gold accent lifts it out of the generic-visa-agency-blue trap. Accent is disciplined: CTAs and key highlights only.

### Primary: Navy
| Token | Hex | Use |
|---|---|---|
| `navy-900` | `#0F2A4A` | Headers, footers, primary text on light |
| `navy-800` | `#13315C` | Primary buttons, nav |
| `navy-600` | `#1E466F` | Hover states, links |

### Neutrals: Stone
| Token | Hex | Use |
|---|---|---|
| `stone-50` | `#F7F5F1` | Page background (warm off-white) |
| `stone-100` | `#EDE9E2` | Section backgrounds, cards |
| `stone-300` | `#D6CFC4` | Borders, dividers |
| `ink-700` | `#33383F` | Body text |

### Accent: Muted Gold
| Token | Hex | Use |
|---|---|---|
| `gold-500` | `#C6A15B` | CTAs, highlights, key underlines |
| `gold-600` | `#A9873F` | Accent hover |

### Support / semantic
| Token | Hex | Use |
|---|---|---|
| `white` | `#FFFFFF` | Cards, surfaces |
| `success` | `#2E7D5B` | Form success |
| `error` | `#B23B3B` | Form errors |
| `focus` | `#2E8B8B` | Focus ring (a11y) |

**Contrast:** all text/background pairs meet WCAG AA. Never rely on colour alone for meaning.

---

## 2. Typography

- **Headings:** a refined serif or high-quality grotesque: e.g. *Fraunces* / *Source Serif* (authority) OR *Inter Tight* / *General Sans* (modern-professional). Recommend serif headings + sans body for the premium, established-but-approachable feel.
- **Body:** *Inter* or *Source Sans*: highly legible, screen-optimised.

### Scale (rem, 1rem = 16px)
| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 3.0 | 600 | Hero |
| `h1` | 2.25 | 600 | Page titles |
| `h2` | 1.75 | 600 | Section headings |
| `h3` | 1.375 | 600 | Sub-sections |
| `body-lg` | 1.125 | 400 | Intro paragraphs |
| `body` | 1.0 | 400 | Default |
| `small` | 0.875 | 400 | Captions, legal |

- Line-height: 1.6 body, 1.2 headings. Max text width ~68ch for readability.

---

## 3. Spacing & Layout

- Base unit: 4px. Scale: 4/8/12/16/24/32/48/64/96.
- Container max-width: 1200px; content 720-800px.
- Generous section padding (64-96px desktop, 40-56px mobile).
- 12-column responsive grid; single-column stacking on mobile.

---

## 4. Components

- **Buttons:** Primary (navy fill), Accent (gold fill, for main CTA), Secondary (navy outline), Ghost (text). Rounded-md (6-8px), clear hover/focus states.
- **CTA block:** reusable band: heading + "Book a Consultation" / "Speak to an Immigration Adviser".
- **Service card:** icon, title, short description, "Learn more". Used on index; auto-populated from CMS.
- **Outcome-disclaimer block:** persistent, understated note on service pages: never implies guaranteed success.
- **Adviser card:** photo, name, title, regulatory level, registration no. (fields ready, populated at launch).
- **Article card:** thumbnail, category tag, title, date, excerpt.
- **Enquiry form:** grouped fields, inline validation, consent checkbox, clear submit; secure/encrypted messaging.
- **Nav:** clean top bar, sticky, mobile hamburger; prominent single accent CTA.
- **Footer:** contact, service links, legal/regulatory links, placeholder regulatory-info region (empty until launch).
- **Cookie banner:** granular consent toggles.

---

## 5. Imagery & Iconography

- Abstract "bridge" motif in logo: keep it geometric/subtle; **avoid** passport/skyline/flag clichés.
- Photography: authentic, calm, human: real people/consultation settings, not stock "handshake over globe".
- Line icons, consistent stroke weight, navy or gold.

---

## 6. Tone of Voice (content design)

- Clear, plain-English, reassuring, professional. No jargon walls.
- No aggressive marketing; **no promises of immigration outcomes**.
- CTAs: "Book a Consultation", "Speak to an Immigration Adviser", "Make an Enquiry", "Contact TrustBridge".

---

## 7. Accessibility

- WCAG 2.1 AA target. Visible focus rings (`focus` token). Keyboard-navigable. Semantic HTML/ARIA. Respects reduced-motion. Alt text on images.

---

## 8. Motion

- Subtle, purposeful only: gentle fades/slide-ins on scroll, smooth hovers. Nothing flashy: restraint signals premium.