/**
 * Site-wide facts and copy.
 *
 * Anything the client must confirm before launch is marked with
 * `needsClientConfirmation`. Nothing in this file may state or imply a
 * guaranteed immigration outcome, and no regulatory claim appears here until
 * the client supplies final wording (README rules 1 and 2).
 */

export const SITE = {
  name: 'TrustBridge Immigration Services Ltd',
  shortName: 'TrustBridge',
  /** Used in running copy, where the full legal name reads heavily. */
  tagline: 'Clear, careful immigration advice',
  description:
    'TrustBridge Immigration Services Ltd advises individuals, families and employers on United Kingdom immigration applications, from first consultation through to submission.',
  companyNumber: '17399361',
  incorporatedIn: 'England and Wales',
  url: 'https://trustbridgeimmigration.co.uk',
} as const;

export const CONTACT = {
  email: 'info@trustbridgeimmigration.co.uk',
  phone: '07417 487423',
  /** Tel: href form, spaces removed. */
  phoneHref: '+447417487423',
  /** TODO-CLIENT: registered office address for the footer and legal pages. */
  address: {
    lines: [] as readonly string[],
    needsClientConfirmation: true,
  },
  /** TODO-CLIENT: confirm published office hours before launch. */
  hours: {
    value: '',
    needsClientConfirmation: true,
  },
} as const;

export interface StatItem {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
  /** True while the figure is a placeholder awaiting the client. */
  readonly needsClientConfirmation: boolean;
  /**
   * Names a figure the band fills in at render rather than one held here.
   * Used where a hard-coded number could drift from what the page shows.
   */
  readonly derived?: 'visibleServiceCount';
}

/**
 * Stat blocks carry verifiable facts only.
 *
 * Client counts, approval rates and success percentages are deliberately
 * absent: a published success rate would imply a likely outcome, which the
 * brief prohibits outright. Placeholders below are visibly incomplete so they
 * cannot reach production looking like real figures.
 */
export const STATS: readonly StatItem[] = [
  {
    // The value is filled in at render from the services actually published,
    // so it cannot disagree with the grid when a feature flag is switched on.
    value: '',
    label: 'Service areas',
    detail: 'Covering family, work, visitor, settlement and citizenship applications.',
    needsClientConfirmation: false,
    derived: 'visibleServiceCount',
  },
  {
    value: '4',
    label: 'Steps to submission',
    detail: 'From first consultation to a checked application, with costs agreed up front.',
    needsClientConfirmation: false,
  },
  {
    value: 'TBC',
    label: 'Languages spoken',
    detail: 'To be confirmed with the practice before launch.',
    needsClientConfirmation: true,
  },
  {
    value: 'TBC',
    label: 'Enquiry response',
    detail: 'Published response time to be confirmed with the practice.',
    needsClientConfirmation: true,
  },
];

/**
 * The outcome disclaimer (PRD §6.5). One string, used by every service page
 * and the enquiry form, so the wording can never drift between pages.
 */
export const OUTCOME_DISCLAIMER = {
  heading: 'About immigration outcomes',
  body: 'No adviser can guarantee the result of an immigration application. Decisions rest with the Home Office, which assesses each case against the Immigration Rules and the evidence provided. Our role is to explain the requirements clearly, help you prepare a well-evidenced application, and tell you plainly where we think the difficulties lie.',
} as const;

/**
 * Regulatory information is left as an empty region until the client supplies
 * final wording. No badge, logo or claim of regulation appears anywhere on the
 * site before then (README rule 2).
 */
export const REGULATORY_PLACEHOLDER = {
  heading: 'Regulatory information',
  body: 'Details of our regulatory status and the level at which our advisers are authorised will be published here before the site goes live.',
  awaitingClientWording: true,
} as const;

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Our team', href: '/team' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
];

export const LEGAL_NAV: readonly NavItem[] = [
  { label: 'Privacy policy', href: '/legal/privacy-policy' },
  { label: 'Cookie policy', href: '/legal/cookie-policy' },
  { label: 'Terms and conditions', href: '/legal/terms-and-conditions' },
  { label: 'Complaints procedure', href: '/legal/complaints-procedure' },
  { label: 'Regulatory information', href: '/legal/regulatory-information' },
  { label: 'Accessibility', href: '/legal/accessibility' },
];

/** The four CTA labels specified in PRD §6.5. */
export const CTA_LABELS = {
  book: 'Book a consultation',
  speak: 'Speak to an immigration adviser',
  enquire: 'Make an enquiry',
  contact: 'Contact TrustBridge',
} as const;
