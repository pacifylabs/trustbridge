import type { Adviser } from '@/lib/content/types';

/**
 * Adviser profiles.
 *
 * Deliberately empty. The content model is built and the page renders an
 * honest empty state until the client supplies real names, professional titles
 * and regulatory levels (PRD §6.3, README rule 6).
 *
 * Never add a placeholder name here. A fabricated name sitting next to a
 * regulatory level is the most damaging placeholder this site could carry.
 */
export const ADVISERS: readonly Adviser[] = [];

/**
 * Development-only seeds, used to check that the adviser grid aligns and that
 * cards share equal height when populated. Loaded only when NODE_ENV is
 * 'development', so these never reach staging or production.
 */
export const DEV_ADVISER_SEEDS: readonly Adviser[] = [
  {
    slug: 'sample-adviser-one',
    name: 'Sample Adviser One',
    professionalTitle: 'Immigration Adviser',
    regulatoryLevel: 'Regulatory level to be confirmed',
    registrationNumber: 'Registration number to be confirmed',
    biography: [
      'Layout sample only. This profile exists so the adviser grid can be checked with content in it, and is never rendered outside local development.',
    ],
    linkedServiceSlugs: ['spouse-and-partner-visas', 'settlement-indefinite-leave-to-remain'],
  },
  {
    slug: 'sample-adviser-two',
    name: 'Sample Adviser Two',
    professionalTitle: 'Immigration Adviser',
    regulatoryLevel: 'Regulatory level to be confirmed',
    registrationNumber: 'Registration number to be confirmed',
    biography: [
      'Layout sample only. A deliberately longer biography, so that unequal text lengths can be checked against the equal-height card rule before real profiles arrive.',
    ],
    linkedServiceSlugs: ['skilled-worker-visas'],
  },
  {
    slug: 'sample-adviser-three',
    name: 'Sample Adviser Three',
    professionalTitle: 'Immigration Adviser',
    regulatoryLevel: 'Regulatory level to be confirmed',
    registrationNumber: 'Registration number to be confirmed',
    biography: ['Layout sample only.'],
    linkedServiceSlugs: ['british-citizenship', 'eu-settlement-scheme'],
  },
];
