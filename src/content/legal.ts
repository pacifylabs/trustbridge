import type { LegalPage } from '@/lib/content/types';

/**
 * Legal and regulatory pages.
 *
 * Structure is live so the footer links resolve and the information
 * architecture can be reviewed. Wording is explicitly pending: no page here
 * makes a regulatory claim, and each carries a visible notice saying the final
 * text is to be supplied (PRD §4, README rule 2).
 */
const PENDING = 'Final wording for this section is to be supplied by the practice before launch.';

export const LEGAL_PAGES: readonly LegalPage[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy policy',
    summary:
      'How TrustBridge collects, uses, stores and deletes the personal information you provide.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'Who we are and how to contact us', body: PENDING },
      { heading: 'The information we collect', body: PENDING },
      { heading: 'Why we process it, and our lawful basis', body: PENDING },
      { heading: 'Who we share it with', body: PENDING },
      { heading: 'How long we keep it', body: PENDING },
      { heading: 'Your rights, including access and erasure', body: PENDING },
      { heading: 'How to complain to the Information Commissioner', body: PENDING },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie policy',
    summary: 'What this website stores on your device, and how to control it.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'What cookies this site uses', body: PENDING },
      { heading: 'Essential and non-essential cookies', body: PENDING },
      { heading: 'Managing your preferences', body: PENDING },
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms and conditions',
    summary: 'The terms on which this website and our services are provided.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'Use of this website', body: PENDING },
      { heading: 'The scope of our services', body: PENDING },
      { heading: 'Fees and payment', body: PENDING },
      { heading: 'Liability', body: PENDING },
      { heading: 'Governing law', body: PENDING },
    ],
  },
  {
    slug: 'complaints-procedure',
    title: 'Complaints procedure',
    summary: 'How to raise a concern about our service, and what happens next.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'How to make a complaint', body: PENDING },
      { heading: 'How we will handle it, and within what period', body: PENDING },
      { heading: 'What to do if you remain dissatisfied', body: PENDING },
    ],
  },
  {
    slug: 'regulatory-information',
    title: 'Regulatory information',
    summary: 'Details of our regulatory status and the advice we are authorised to give.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'Our regulatory status', body: PENDING },
      { heading: 'The level at which our advisers are authorised', body: PENDING },
      { heading: 'Company information', body: PENDING },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    summary: 'How accessible this website is, and how to tell us about a problem.',
    awaitingFinalWording: true,
    sections: [
      { heading: 'The standard we aim to meet', body: PENDING },
      { heading: 'Known limitations', body: PENDING },
      { heading: 'Reporting an accessibility problem', body: PENDING },
    ],
  },
];
