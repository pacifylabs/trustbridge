import type { ProcessStep } from '@/components/blocks/ProcessSteps';

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
    eyebrow: 'UK immigration advice',
    lead: 'Immigration advice that is',
    emphasis: 'clear from the start',
    standfirst:
      'TrustBridge advises individuals, families and employers on United Kingdom immigration applications. We explain what each route requires, help you evidence it properly, and tell you plainly where the difficulties lie.',
  },
  services: {
    eyebrow: 'What we do',
    lead: 'Advice across the routes',
    emphasis: 'people actually need',
    standfirst:
      'Each service below sets out who it is for, what the application requires and what working with us involves.',
  },
  approach: {
    eyebrow: 'How we work',
    lead: 'A straightforward',
    emphasis: 'way of working',
    standfirst:
      'Four steps, with no obligation to continue beyond the first. You will know where you stand before you commit to anything.',
    steps: [
      {
        title: 'First consultation',
        body: 'We go through your history and circumstances, and set out the routes realistically open to you.',
      },
      {
        title: 'Written summary',
        body: 'You receive a written note of the options discussed, what each requires, and what it would cost.',
      },
      {
        title: 'Preparing the application',
        body: 'If you instruct us, we work through the evidence with you and review everything before submission.',
      },
      {
        title: 'After submission',
        body: 'We keep you informed of the position and explain any further request from the Home Office.',
      },
    ] as readonly ProcessStep[],
  },
  reasons: {
    eyebrow: 'Why clients choose us',
    lead: 'Careful work, and',
    emphasis: 'an honest view',
    standfirst:
      'Immigration decisions rest with the Home Office. What we can control is the quality of the application and the clarity of the advice behind it.',
    items: [
      {
        title: 'Plain English, not jargon',
        body: 'The Immigration Rules are dense. Our job is to translate them into what you actually need to do, in what order.',
      },
      {
        title: 'Told early where the difficulty is',
        body: 'If we can see a weakness in your case, you will hear about it at the first consultation rather than after a refusal.',
      },
      {
        title: 'Evidence prepared properly',
        body: 'Most refusals we see come down to evidence: the wrong document, the wrong period, or a gap left unexplained.',
      },
      {
        title: 'Clear on scope and cost',
        body: 'You will know what the work covers, what it costs, and what falls outside what we are able to advise on.',
      },
      {
        title: 'Responsive to your questions',
        body: 'An application is stressful. We would rather answer a question twice than leave you guessing about the position.',
      },
      {
        title: 'Confidential by default',
        body: 'Your information is held securely, shared only with those working on your matter, and deleted when it is no longer needed.',
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
    'Visitor visas',
    'EU Settlement Scheme',
  ],
  /*
    Sample testimonials, to be replaced with the practice's own once real
    clients have approved their words.

    Two rules held to while writing them, which apply to whatever replaces
    them: nothing refers to the result of an application, and nobody is given
    an invented full name. Each is attributed by route and region, which is
    how a firm can quote a client without publishing their identity.
  */
  testimonials: {
    eyebrow: 'In their words',
    lead: 'What working with us',
    emphasis: 'actually feels like',
    standfirst:
      'Clients tell us the same thing more often than anything else: they finally understood what was being asked of them.',
    items: [
      {
        quote:
          'I had read the guidance three times and still could not tell which parts applied to me. Half an hour into the first consultation I had a list of what to gather and the order to do it in.',
        attribution: 'Spouse visa client',
        location: 'Manchester',
      },
      {
        quote:
          'What I valued most was being told plainly where my case was weak. Nobody had done that before, and it changed how we put the application together.',
        attribution: 'Skilled Worker client',
        location: 'Birmingham',
      },
      {
        quote:
          'They answered the same question twice without ever making me feel awkward for asking. When you are dealing with your family, that matters more than people realise.',
        attribution: 'Family visa client',
        location: 'London',
      },
      {
        quote:
          'The written summary after the consultation was the useful part. I could read it again a week later instead of trying to remember what had been said.',
        attribution: 'Settlement client',
        location: 'Leeds',
      },
      {
        quote:
          'We are a small employer and had never sponsored anyone. The duties were explained in terms of what we actually had to do each month, not just quoted at us.',
        attribution: 'Business immigration client',
        location: 'Bristol',
      },
    ],
  },
  resources: {
    eyebrow: 'Resources',
    lead: 'Notes on working with us and',
    emphasis: 'the process itself',
    standfirst:
      'Short pieces on what to expect, what things cost, and how we handle your information.',
  },
} as const;

export const ABOUT = {
  hero: {
    eyebrow: 'About the practice',
    lead: 'A practice built on',
    emphasis: 'careful advice',
    standfirst:
      'TrustBridge Immigration Services Ltd is a United Kingdom immigration advice practice working with individuals, families and employers. We are registered in England and Wales.',
  },
  /* Hero frames. Reuses existing artwork rather than adding more downloads. */
  media: [
    { src: '/images/services/settlement-indefinite-leave-to-remain.webp', alt: 'The entrance to a home', width: 900, height: 600 },
    { src: '/images/cluster/london-street.webp', alt: 'A London street', width: 625, height: 469 },
    { src: '/images/cluster/family.webp', alt: 'An adult and child walking together', width: 800, height: 600, placeholderLabel: 'Family at home' },
  ],
  story: {
    eyebrow: 'Our approach',
    lead: 'Why we set the practice up',
    emphasis: 'this way',
    paragraphs: [
      'Most people meeting the Immigration Rules for the first time are not short of information. They are short of a clear account of which parts apply to them, in what order, and what the caseworker will actually be looking for.',
      'We built the practice around that gap. Each matter starts with a proper look at your circumstances and an honest view of the options, including the ones we would advise against.',
      'That approach shapes how we work: fewer assumptions, more questions at the outset, and a written record of what was advised so you are not relying on memory weeks later.',
    ],
  },
  values: {
    eyebrow: 'What we hold to',
    lead: 'Three things we',
    emphasis: 'will not compromise on',
    items: [
      {
        title: 'Trust',
        body: 'We tell you what we think, including when it is not what you were hoping to hear. An adviser who only delivers good news is not much use when a decision goes the other way.',
      },
      {
        title: 'Clarity',
        body: 'Every requirement is explained in terms you can act on. If we have written something you cannot follow, that is a failing on our part rather than yours.',
      },
      {
        title: 'Professionalism',
        body: 'We work within the scope of what we are authorised to advise on, keep your information secure, and say so plainly when a matter needs someone else.',
      },
    ],
  },
  team: {
    eyebrow: 'Our people',
    lead: 'The advisers',
    emphasis: 'behind the practice',
    standfirst:
      'Adviser profiles, including professional titles and regulatory details, will be published here before the site goes live.',
  },
} as const;

export const CONTACT_PAGE = {
  hero: {
    eyebrow: 'Contact',
    lead: 'Tell us about',
    emphasis: 'your situation',
    standfirst:
      'Send us a summary of your circumstances and we will come back to you. If your matter is urgent, please call rather than using the form.',
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
      'Online booking will open when the site goes live. Until then, please get in touch by email or telephone and we will arrange a time with you directly.',
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
    heading: 'Profiles to be published',
    body: 'Adviser profiles will appear here once the practice has confirmed professional titles, regulatory levels and registration numbers. We publish nothing about regulatory status until it is confirmed.',
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
    body: 'Articles will appear here once the practice begins publishing. The section is managed through the content system, so staff can add and edit pieces without a developer.',
  },
} as const;

export const SERVICES_PAGE = {
  hero: {
    eyebrow: 'Services',
    lead: 'Immigration advice',
    emphasis: 'by route',
    standfirst:
      'Choose the area closest to your circumstances. If none of them quite fits, get in touch and we will tell you which applies.',
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
