import type { ProcessStep } from '@/components/blocks/ProcessSteps';
import type { Testimonial } from '@/lib/content/types';

/**
 * Page copy for Home, About and the standalone pages.
 *
 * Held separately from the components so the client can replace wording
 * without touching layout. Written in plain British English, with no claim
 * about the outcome of any application and no statement about our regulatory
 * status (README rules 1 and 2).
 */

export const HOME = {
  hero: {
    eyebrow: 'UK Immigration Experts',
    lead: 'Navigating UK immigration with',
    emphasis: 'confidence and clarity',
    standfirst:
      'TrustBridge delivers tailored UK immigration solutions. We decipher complex rules and build robust applications, providing strategic advice every step of the way.',
  },
  services: {
    eyebrow: 'Our expertise',
    lead: 'Specialised advice across',
    emphasis: 'major UK visa routes',
    standfirst:
      'Explore our core practice areas. Each service sets out who it is for, the requirements, and how we manage your application.',
  },
  approach: {
    eyebrow: 'How we work',
    lead: 'A transparent,',
    emphasis: 'strategic approach',
    standfirst:
      'Our four-step process is designed to give you absolute clarity. You will understand your options, costs, and timeline before committing to any instruction.',
    steps: [
      {
        title: 'First consultation',
        body: 'We review your history and present the routes open to you.',
      },
      {
        title: 'Written summary',
        body: 'Where appropriate, clients will receive confirmation of the key advice, options or next steps arising from their consultation.',
      },
      {
        title: 'Preparing the application',
        body: 'We assemble your evidence and review the bundle before submission.',
      },
      {
        title: 'After submission',
        body: 'We manage all Home Office correspondence until a decision is made.',
      },
    ] as readonly ProcessStep[],
  },
  reasons: {
    eyebrow: 'Why clients choose us',
    lead: 'Meticulous preparation and',
    emphasis: 'unwavering honesty',
    standfirst:
      'Immigration decisions rest with the Home Office. We focus on careful preparation, clear advice and ensuring that applications and supporting evidence address the relevant requirements.',
    items: [
      {
        title: 'Plain English, not jargon',
        body: 'The Immigration Rules are dense. We translate them into what you actually need to do.',
      },
      {
        title: 'Told early where the difficulty is',
        body: 'If your case has a weakness, you will hear about it at the first consultation.',
      },
      {
        title: 'Evidence prepared properly',
        body: 'We carefully review supporting documents and evidence against the relevant immigration requirements, helping to identify and address potential issues before submission.',
      },
      {
        title: 'Clear on scope and cost',
        body: 'You will know exactly what the work covers and what it costs upfront.',
      },
    ],
  },
  /*
    Hero backdrop. UK only: the practice advises on United Kingdom immigration,
    and foreign landmarks would suggest it covers those countries too.

    Chosen for daylight and open composition rather than drama. The night and
    sunset frames that preceded them made the whole section read heavy, and
    busy detail behind the copy panel is what makes a hero look cluttered.
  */
  heroBackdrop: [
    { src: '/images/hero/lake-district.webp', alt: 'A lake in the Lake District on a clear day', width: 1024, height: 512 },
    { src: '/images/hero/cornwall-coast.webp', alt: 'The Cornish coast', width: 1024, height: 512 },
    { src: '/images/hero/oxford.webp', alt: 'Oxford architecture under a blue sky', width: 2000, height: 1000 },
    { src: '/images/hero/york-minster.webp', alt: 'York Minster', width: 1024, height: 512 },
    { src: '/images/hero/london-skyline.webp', alt: 'The London skyline by day', width: 1024, height: 512 },
  ],

  /* The layered frames beside the hero copy. */
  heroMedia: [
    { src: '/images/cluster/consultation.webp', alt: 'A meeting in progress', width: 576, height: 768, placeholderLabel: 'Adviser and client in consultation' },
    { src: '/images/cluster/london-street.webp', alt: 'A London street', width: 625, height: 469, placeholderLabel: 'London street' },
    { src: '/images/cluster/family.webp', alt: 'An adult and child walking together', width: 800, height: 600, placeholderLabel: 'Family at home' },
  ],
  credential: {
    title: 'A registered UK practice',
    subtitle: 'TrustBridge Immigration Services Ltd, registered in England and Wales.',
  },
  ribbon: [
    'Spouse and partner visas',
    'Skilled Worker',
    'Settlement and ILR',
    'British citizenship',
  ],
  /*
    The section heading only — the testimonials themselves are managed from
    /cms/testimonials (Redis-backed) and read via getTestimonials(), not
    stored here. See README rule 6: a fabricated testimonial presented as a
    genuine client's words is a serious problem for a regulated advice
    practice, so nothing is invented here or pre-filled in the CMS form.
  */
  testimonials: {
    eyebrow: 'In their words',
    lead: 'What working with us',
    emphasis: 'actually feels like',
    standfirst:
      'Clients tell us the same thing more often than anything else: they finally understood what was being asked of them.',
  },
  /*
    The section heading only — advisers themselves are managed from
    /cms/team (Redis-backed) and read via getAdvisers(), not stored here.
  */
  team: {
    eyebrow: 'Our team',
    lead: 'The advisers',
    emphasis: 'behind your case',
    standfirst:
      'Every profile sets out who you would be working with, their professional title, and the regulatory details behind their advice.',
  },
  resources: {
    eyebrow: 'Resources',
    lead: 'Notes on working with us and',
    emphasis: 'the process itself',
    standfirst:
      'Short pieces on what to expect, what things cost, and how we handle your information.',
  },
} as const;

/**
 * Development-only seeds, used to check the testimonial slider's layout with
 * content in it. Gated on `NODE_ENV` the same way `DEV_ADVISER_SEEDS` is, so
 * there is no configuration under which these reach staging or production.
 *
 * Never add a real-sounding name or outcome here: see `HOME.testimonials`.
 */
export const DEV_TESTIMONIAL_SEEDS: readonly Testimonial[] = [
  {
    slug: 'dev-seed-spouse-visa-manchester',
    quote:
      'I had read the guidance three times and still could not tell which parts applied to me. Half an hour into the first consultation I had a list of what to gather and the order to do it in.',
    attribution: 'Spouse visa client',
    location: 'Manchester',
    status: 'published',
  },
  {
    slug: 'dev-seed-skilled-worker-birmingham',
    quote:
      'What I valued most was being told plainly where my case was weak. Nobody had done that before, and it changed how we put the application together.',
    attribution: 'Skilled Worker client',
    location: 'Birmingham',
    status: 'published',
  },
  {
    slug: 'dev-seed-family-visa-london',
    quote:
      'They answered the same question twice without ever making me feel awkward for asking. When you are dealing with your family, that matters more than people realise.',
    attribution: 'Family visa client',
    location: 'London',
    status: 'published',
  },
] as const;

export const ABOUT = {
  hero: {
    eyebrow: 'About the practice',
    lead: 'A practice built on',
    emphasis: 'careful advice',
    standfirst:
      'TrustBridge Immigration Services is a registered UK practice. Our mission is to bring clarity to a complex system, providing straightforward guidance so you can navigate immigration with confidence.',
  },
  /* Hero frames. Reuses existing artwork rather than adding more downloads. */
  media: [
    { src: '/images/services/settlement-indefinite-leave-to-remain.webp', alt: 'The entrance to a home', width: 900, height: 600 },
    { src: '/images/cluster/london-street.webp', alt: 'A London street', width: 625, height: 469 },
    { src: '/images/cluster/family.webp', alt: 'An adult and child walking together', width: 800, height: 600, placeholderLabel: 'Family at home' },
  ],
  story: {
    eyebrow: 'About us',
    lead: 'A practice built on',
    emphasis: 'clarity and care',
    paragraphs: [
      'TrustBridge Immigration Services Ltd is a UK-based immigration practice established to provide clear, professional and client-focused immigration advice and services to individuals, families and businesses.',
      "We understand that immigration decisions can affect some of the most important aspects of a person's life, including family, career, business and long-term plans. Our approach is therefore centred on understanding each client's individual circumstances, providing clear and practical advice, and preparing matters carefully and professionally.",
      'TrustBridge combines professional immigration expertise with a modern, efficient and accessible approach to client service. We are committed to clear communication, attention to detail, confidentiality and treating every client with respect.',
      'Our practice is being developed to provide support across a broad range of UK immigration matters, with cases handled by advisers with the appropriate level of authorisation and competence for the work involved.',
    ],
  },
  missionVision: {
    mission: {
      title: 'Our mission',
      body: 'To provide clear, reliable and professional UK immigration advice that helps individuals, families and businesses understand their options and navigate the immigration system with confidence.',
    },
    vision: {
      title: 'Our vision',
      body: 'To build a trusted and respected immigration practice recognised for professional standards, sound judgement, excellent client service and a commitment to helping clients navigate complex immigration matters with clarity and confidence.',
    },
  },
  values: {
    eyebrow: 'Our values',
    lead: 'The principles',
    emphasis: 'behind our work',
    items: [
      {
        title: 'Trust and Integrity',
        body: 'We act honestly, responsibly and in the best interests of our clients.',
      },
      {
        title: 'Clarity',
        body: 'Immigration law can be complex. We aim to explain options, requirements and risks in clear and understandable language.',
      },
      {
        title: 'Professionalism',
        body: 'We approach every matter carefully, responsibly and with appropriate attention to detail.',
      },
      {
        title: 'Client Focus',
        body: "Every client's circumstances are different. We listen, understand the individual situation and provide advice appropriate to the client's needs.",
      },
      {
        title: 'Confidentiality',
        body: 'We recognise the sensitive nature of immigration matters and treat client information with appropriate care and confidentiality.',
      },
      {
        title: 'Continuous Development',
        body: 'Immigration law and policy continually evolve. We are committed to maintaining professional competence and keeping our knowledge and practices up to date.',
      },
    ],
  },
  team: {
    eyebrow: 'Our people',
    lead: 'The advisers',
    emphasis: 'behind the practice',
    standfirst:
      'Adviser profiles, including professional titles and regulatory details, will be published here shortly.',
  },
} as const;

export const CONTACT_PAGE = {
  hero: {
    eyebrow: 'Contact',
    lead: 'Tell us about',
    emphasis: 'your situation',
    standfirst:
      'Send a short summary of your circumstances and we will get back to you. If your matter is urgent, please call us directly.',
  },
  formHeading: {
    lead: 'Make an',
    emphasis: 'enquiry',
    standfirst:
      'A short summary is enough at this stage. Please do not send passport scans, financial statements or other documents until we have asked for them.',
  },
  whatHappensNext: {
    heading: 'What happens after you write to us',
    steps: [
      'We read what you have sent and check whether we are the right people to help.',
      'If we are, we suggest a consultation and tell you what it costs before you book.',
      'If we are not, we say so and point you towards someone who can.',
    ],
    note: 'Please do not send documents with your first message. We will tell you exactly what we need once we have understood the position.',
  },
} as const;

export const BOOK_PAGE = {
  hero: {
    eyebrow: 'Consultations',
    lead: 'Book a consultation',
    emphasis: 'with an adviser',
    standfirst:
      'Online booking will be available shortly. Until then, please get in touch by email or telephone and we will arrange a time with you directly.',
  },
} as const;

export const TEAM_PAGE = {
  hero: {
    eyebrow: 'Our team',
    lead: 'The advisers you',
    emphasis: 'will be working with',
    standfirst:
      'Each profile will set out the adviser’s professional title, the level at which they are authorised to advise, and their registration number.',
  },
  emptyState: {
    heading: 'Profiles coming soon',
    body: 'Adviser profiles will appear here once the practice has confirmed professional titles, regulatory levels and registration numbers.',
  },
} as const;

export const RESOURCES_PAGE = {
  hero: {
    eyebrow: 'Resources',
    lead: 'Notes, updates and',
    emphasis: 'practical guidance',
    standfirst:
      'Short pieces on how the process works and what to expect. Nothing here is advice on your particular circumstances, which needs a proper look at your case.',
  },
  emptyState: {
    heading: 'No articles published yet',
    body: 'Articles will appear here once the practice begins publishing. New pieces are added through the development process and go live with each deployment.',
  },
} as const;

export const SERVICES_PAGE = {
  hero: {
    eyebrow: 'Services',
    lead: 'Immigration advice',
    emphasis: 'by route',
    standfirst:
      'Choose the area closest to your circumstances. If you are unsure which applies, get in touch and we will guide you.',
  },
} as const;

export const COMING_SOON = {
  eyebrow: 'UK immigration advice',
  lead: 'Clear immigration advice,',
  emphasis: 'coming shortly',
  standfirst:
    'TrustBridge Immigration Services Ltd advises individuals, families and employers on United Kingdom immigration applications. Our website is being prepared. Until it opens, please get in touch directly and we will help you the same way we would through the site.',
  /* What the practice covers, kept short: this is a holding page, not a menu. */
  routes: [
    'Spouse and partner visas',
    'Skilled Worker',
    'Health and Care Worker',
    'Settlement and citizenship',
  ],
} as const;
