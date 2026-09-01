import type { Service } from '@/lib/content/types';

/**
 * Seeded service content.
 *
 * PRD §5 defines nine categories; §4 publishes eight of them as routes in v1.
 * "Immigration status and application support" exists in the taxonomy with no
 * page yet, so the client can add one as data rather than as a code change.
 * Complex matters is present but gated (README rule 4).
 *
 * Copy rules applied throughout: plain English, no guaranteed outcomes, no
 * regulatory claims, and no promises about processing times we cannot control.
 */
export const SERVICES: readonly Service[] = [
  {
    slug: 'spouse-and-partner-visas',
    image: {
      src: '/images/services/spouse-and-partner-visas.webp',
      alt: 'A couple on their wedding day',
      width: 900,
      height: 600,
    },
    category: 'family-partner',
    title: 'Spouse and partner visas',
    shortTitle: 'Spouse and partner',
    summary:
      'Advice for couples applying to live together in the UK, including first applications, extensions and switching from another visa.',
    icon: 'users',
    order: 1,
    intro: [
      'Partner applications turn on evidence. The Home Office needs to see that your relationship is genuine and subsisting, that you meet the financial requirement, and that your English language and accommodation arrangements are in order.',
      'We work through each requirement with you, tell you what the caseworker will be looking for, and help you assemble a bundle that answers those questions clearly.',
    ],
    audience: [
      'Partners of British citizens applying from outside the UK',
      'Couples switching into the partner route from another visa',
      'Applicants extending partner leave before it expires',
      'Unmarried partners evidencing two years of cohabitation',
      'Fiancés and proposed civil partners planning to marry in the UK',
      'Families where a child is included in the application',
    ],
    includes: [
      'An assessment of which partner route fits your circumstances',
      'A review of the financial requirement and the evidence that supports it',
      'Guidance on relationship evidence and how much is enough',
      'A document checklist tailored to your case',
      'Review of your completed forms before submission',
      'Clear advice on any weaknesses we can see in the application',
    ],
    sections: [
      {
        heading: 'The financial requirement',
        body: [
          'Most partner applications require the sponsoring partner to meet a minimum income threshold, which can be met through employment, self-employment, savings, or a combination of sources.',
          'The rules on what counts, and on the periods the evidence must cover, are detailed and easy to fall foul of. We check your position against the current requirement before you apply and set out precisely which documents you will need.',
        ],
      },
      {
        heading: 'Evidencing your relationship',
        body: [
          'There is no fixed list of documents that proves a relationship. What helps is a coherent picture built over time: correspondence addressed to you both, evidence of shared finances or living arrangements, and a straightforward account of how the relationship developed.',
          'We help you decide what to include and, just as importantly, what to leave out. A focused bundle reads better than an exhaustive one.',
        ],
      },
      {
        heading: 'If your circumstances are unusual',
        body: [
          'Previous refusals, time spent in the UK without leave, gaps in cohabitation and complicated income arrangements all need careful handling. Tell us early. It is far easier to address a difficulty in the application than to explain it after a refusal.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long does a partner application take to decide?',
        answer:
          'Processing times are set by the Home Office and change through the year. We will point you to the current published guidance for your route and application location, but no adviser can commit to a decision date on the Home Office’s behalf.',
      },
      {
        question: 'Can we apply if we have not lived together for two years?',
        answer:
          'It depends on the route. Married couples and civil partners are not required to evidence a period of cohabitation in the same way that unmarried partners are. We will confirm which route applies to you at the first consultation.',
      },
      {
        question: 'Do we need a solicitor as well as an adviser?',
        answer:
          'For most partner applications, no. If your case involves a matter outside the scope of the advice we are authorised to give, we will tell you plainly and explain where to go next.',
      },
    ],
    seo: {
      title: 'Spouse and partner visa advice',
      description:
        'Advice on UK spouse, civil partner and unmarried partner applications, covering the financial requirement, relationship evidence and switching routes.',
    },
  },
  {
    slug: 'visitor-visas',
    image: {
      src: '/images/services/visitor-visas.webp',
      alt: 'An airport terminal',
      width: 900,
      height: 600,
    },
    category: 'visitor',
    title: 'Visitor visas',
    shortTitle: 'Visitor',
    summary:
      'Support for standard visitor applications, including visits to family, short business trips and applications following a previous refusal.',
    icon: 'plane',
    order: 2,
    intro: [
      'Visitor applications look simple and are refused more often than people expect. The decision rests on whether the caseworker accepts that you are a genuine visitor who will leave at the end of your stay.',
      'That judgement is made on the papers, without an interview, so the application has to answer the obvious questions before they are asked.',
    ],
    audience: [
      'Parents and relatives visiting family in the UK',
      'Applicants attending a wedding, graduation or family event',
      'Business visitors attending meetings or conferences',
      'Applicants reapplying after a refusal',
      'Visitors seeking private medical treatment',
      'Academics and researchers on short visits',
    ],
    includes: [
      'A review of your circumstances against the genuine visitor requirement',
      'Advice on evidencing ties to your home country',
      'Guidance on funding the trip and who may sponsor it',
      'Help preparing a clear covering letter and itinerary',
      'A considered response to any previous refusal',
      'A check of your form and supporting documents before submission',
    ],
    sections: [
      {
        heading: 'What caseworkers look for',
        body: [
          'The application should show where you live and work, what you are returning to, who is funding the visit, and what you intend to do while you are here.',
          'Vague applications invite refusal. Specific ones, with dates, addresses and named sponsors, give the caseworker something to accept.',
        ],
      },
      {
        heading: 'Applying after a refusal',
        body: [
          'A previous refusal is not fatal, but repeating the same application rarely helps. We read the refusal notice with you, identify what the caseworker was not satisfied about, and address that point directly in the fresh application.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I extend a visit once I am in the UK?',
        answer:
          'Visitor leave can sometimes be extended, but only in limited circumstances and within the permitted total period. We will advise on whether an extension is available to you before your current leave expires.',
      },
      {
        question: 'Does a refusal affect future applications?',
        answer:
          'A refusal is recorded and will be visible on later applications, so it needs to be addressed rather than ignored. How much weight it carries depends on the reason it was given.',
      },
    ],
    seo: {
      title: 'UK visitor visa advice',
      description:
        'Advice on standard visitor visa applications for family visits, business trips and reapplications following a refusal.',
    },
  },
  {
    slug: 'skilled-worker-visas',
    image: {
      src: '/images/services/skilled-worker-visas.webp',
      alt: 'Colleagues working at a desk',
      width: 900,
      height: 600,
    },
    category: 'work',
    title: 'Skilled Worker visas',
    shortTitle: 'Skilled Worker',
    summary:
      'Advice for workers holding a certificate of sponsorship, covering first applications, extensions, changing employer and dependants.',
    icon: 'briefcase',
    order: 3,
    intro: [
      'The Skilled Worker route requires a sponsoring employer, a job at an eligible skill level, and a salary that meets both the general threshold and the going rate for the occupation code.',
      'Most problems we see come from the detail: the wrong occupation code, a salary calculated on the wrong basis, or a certificate of sponsorship that does not match the job actually being done.',
    ],
    audience: [
      'Workers with a certificate of sponsorship from a licensed employer',
      'Employees changing sponsor or moving to a new role',
      'Applicants extending Skilled Worker leave',
      'Workers bringing partners and children as dependants',
      'Applicants switching into the route from within the UK',
      'Skilled Workers approaching eligibility for settlement',
    ],
    includes: [
      'A check of the role, occupation code and salary against current requirements',
      'Advice on English language and maintenance evidence',
      'Review of the certificate of sponsorship before you apply',
      'Guidance on dependant applications made alongside yours',
      'Advice on continuity of leave when changing employer',
      'A view on your route to settlement and what could interrupt it',
    ],
    sections: [
      {
        heading: 'Salary and occupation codes',
        body: [
          'Eligibility depends on the occupation code assigned to your role, which sets the going rate you must be paid. Codes are not interchangeable, and choosing one that loosely resembles the job creates a problem that surfaces later.',
          'We review the job description against the code your employer has used and raise any mismatch before the certificate of sponsorship is assigned.',
        ],
      },
      {
        heading: 'Changing employer',
        body: [
          'A new sponsor means a new certificate of sponsorship and a new application. You should not start the new role before your application permits it. We set out the sequence clearly so your leave is not put at risk.',
        ],
      },
      {
        heading: 'Dependants',
        body: [
          'Partners and children under 18 can usually apply as dependants, either at the same time as you or later. Applications made together are generally simpler to evidence, particularly where funds are concerned.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I change jobs on a Skilled Worker visa?',
        answer:
          'You can, but a change of employer requires a fresh certificate of sponsorship and a new application. Some changes with the same employer, such as a promotion within the same occupation code, are handled differently.',
      },
      {
        question: 'Does time on this route count towards settlement?',
        answer:
          'Time spent on the Skilled Worker route can count towards indefinite leave to remain, provided the continuous residence and other requirements are met throughout. Absences and gaps in leave are the usual complications.',
      },
    ],
    seo: {
      title: 'Skilled Worker visa advice',
      description:
        'Advice on Skilled Worker applications, occupation codes, salary thresholds, changing sponsor and dependant applications.',
    },
  },
  {
    slug: 'health-and-care-worker-visas',
    image: {
      src: '/images/services/health-and-care-worker-visas.webp',
      alt: 'A nurse with a patient at home',
      width: 900,
      height: 600,
    },
    category: 'work',
    title: 'Health and Care Worker visas',
    shortTitle: 'Health and Care Worker',
    summary:
      'Advice for eligible health and care professionals sponsored by an approved employer, including dependants and settlement.',
    icon: 'award',
    order: 4,
    intro: [
      'The Health and Care Worker route is a form of Skilled Worker visa for qualifying medical and care professionals sponsored by an approved employer.',
      'Eligibility turns on the occupation code, the employer’s approval to sponsor on this route, and in some roles a relevant professional registration.',
    ],
    audience: [
      'Doctors, nurses and allied health professionals',
      'Adult social care workers sponsored by an approved provider',
      'Applicants moving from another route into health and care work',
      'Professionals awaiting or holding UK registration',
      'Applicants bringing partners and children as dependants',
      'Workers extending leave or approaching settlement',
    ],
    includes: [
      'Confirmation that the role and employer qualify for this route',
      'Advice on professional registration requirements where they apply',
      'A review of salary against the going rate for the occupation code',
      'Guidance on dependant applications',
      'Advice on continuous residence and settlement',
      'Review of your application before submission',
    ],
    sections: [
      {
        heading: 'Eligible roles and employers',
        body: [
          'Not every health or care role qualifies, and not every employer is approved to sponsor on this route. Both need to be confirmed before you rely on the reduced fees and other features that distinguish it from the general Skilled Worker route.',
        ],
      },
      {
        heading: 'Professional registration',
        body: [
          'Several roles require registration with the relevant UK professional body, and the timing of that registration matters. We will tell you where registration sits in the sequence so it does not hold up the application.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this route different from a Skilled Worker visa?',
        answer:
          'It is a distinct route with its own eligibility conditions, though it shares much of the Skilled Worker framework. Whether you qualify depends on the occupation code and the sponsoring employer.',
      },
      {
        question: 'Can my family come with me?',
        answer:
          'Partners and children under 18 can usually apply as dependants. We will confirm the evidence required for your circumstances at the first consultation.',
      },
    ],
    seo: {
      title: 'Health and Care Worker visa advice',
      description:
        'Advice for health and social care professionals applying on the Health and Care Worker route, including registration and dependants.',
    },
  },
  {
    slug: 'settlement-indefinite-leave-to-remain',
    image: {
      src: '/images/services/settlement-indefinite-leave-to-remain.webp',
      alt: 'The entrance to a home',
      width: 900,
      height: 600,
    },
    category: 'settlement',
    title: 'Settlement and indefinite leave to remain',
    shortTitle: 'Settlement and ILR',
    summary:
      'Advice on qualifying for indefinite leave to remain, including continuous residence, absences and the Life in the UK requirement.',
    icon: 'home',
    order: 5,
    intro: [
      'Settlement is the point at which your right to live in the UK stops depending on a time-limited visa. The qualifying period and conditions vary by route, and the detail matters more here than almost anywhere else.',
      'Most difficulties come down to continuous residence: an absence that ran long, a gap between visas, or time on a route that does not count.',
    ],
    audience: [
      'Applicants completing five years on a work or partner route',
      'Those with long residence in the UK',
      'Applicants with absences they are unsure about',
      'People whose leave has been on more than one route',
      'Applicants preparing for the Life in the UK test',
      'Anyone unsure when they become eligible',
    ],
    includes: [
      'A calculation of your qualifying period and eligibility date',
      'A review of absences against the continuous residence rules',
      'Advice on the Life in the UK and English language requirements',
      'Guidance where your leave has spanned several routes',
      'A document checklist covering the full qualifying period',
      'Advice on the effect of any gap in your leave',
    ],
    sections: [
      {
        heading: 'Continuous residence and absences',
        body: [
          'Most settlement routes limit how long you can spend outside the UK during the qualifying period, both in any twelve-month window and in total.',
          'Work out your absences early, from your own records rather than from memory. If they exceed the limit, there may be options, but they need identifying well before you apply.',
        ],
      },
      {
        heading: 'The Life in the UK test',
        body: [
          'Most applicants must pass the Life in the UK test and meet an English language requirement, subject to limited exemptions. Both should be completed before the application is submitted, not alongside it.',
        ],
      },
      {
        heading: 'Time on more than one route',
        body: [
          'Combining time across routes is possible in some circumstances and not in others. If your leave has changed category, bring the full history to the first consultation so we can map it properly.',
        ],
      },
    ],
    faqs: [
      {
        question: 'When can I apply for settlement?',
        answer:
          'The qualifying period depends on your route and is usually five years, though some routes differ. We will calculate your earliest eligibility date from your actual immigration history.',
      },
      {
        question: 'What happens if I have exceeded the absence limits?',
        answer:
          'That depends on the reason for the absences and the route you are on. Some absences may be disregarded in defined circumstances. It is worth taking advice before assuming the position is lost.',
      },
    ],
    seo: {
      title: 'Settlement and indefinite leave to remain advice',
      description:
        'Advice on applying for indefinite leave to remain, covering continuous residence, absences, Life in the UK and combined routes.',
    },
  },
  {
    slug: 'british-citizenship',
    image: {
      src: '/images/services/british-citizenship.webp',
      alt: 'The Union flag',
      width: 900,
      height: 600,
    },
    category: 'citizenship',
    title: 'British citizenship',
    shortTitle: 'British citizenship',
    summary:
      'Advice on naturalisation and registration, including the residence requirements, good character and applications for children.',
    icon: 'globe',
    order: 6,
    intro: [
      'Citizenship is usually the step after settlement. Naturalisation has its own residence requirements, which are calculated differently from those for indefinite leave to remain.',
      'The good character requirement applies throughout, and it covers more than criminal convictions.',
    ],
    audience: [
      'Settled applicants naturalising as British citizens',
      'Spouses and civil partners of British citizens',
      'Parents registering a child as a British citizen',
      'Applicants unsure whether they are already British',
      'Applicants with previous immigration breaches to address',
      'Those checking their absences before applying',
    ],
    includes: [
      'Confirmation of the route and requirements that apply to you',
      'A calculation of residence and absences over the qualifying period',
      'Advice on the good character requirement and anything you should disclose',
      'Guidance on referees and the documents required',
      'Advice on registration applications for children',
      'A review of your application before submission',
    ],
    sections: [
      {
        heading: 'Residence and absences',
        body: [
          'Naturalisation counts absences over a defined qualifying period, and the limits differ from those used for settlement. Being eligible for one does not automatically mean you are eligible for the other.',
        ],
      },
      {
        heading: 'Good character',
        body: [
          'The good character assessment considers criminality, immigration history, financial matters such as bankruptcy and unpaid tax, and the accuracy of previous applications.',
          'Where there is something to disclose, disclosing it properly with an explanation is generally better than hoping it is not noticed.',
        ],
      },
      {
        heading: 'Children',
        body: [
          'Some children are British automatically, some have an entitlement to be registered, and others can be registered at the Home Secretary’s discretion. Establishing which applies is the first step, and it is worth doing before paying a fee.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I have to hold settlement before naturalising?',
        answer:
          'Most applicants must hold indefinite leave to remain or settled status first, and in many cases must have held it for a period before applying. The requirements differ for spouses of British citizens.',
      },
      {
        question: 'Can I keep my existing nationality?',
        answer:
          'The United Kingdom permits dual nationality, but your other country of nationality may not. That is a question for the authorities of that country, and it is worth checking before you apply.',
      },
    ],
    seo: {
      title: 'British citizenship and naturalisation advice',
      description:
        'Advice on naturalising as a British citizen, registration applications for children, residence requirements and good character.',
    },
  },
  {
    slug: 'eu-settlement-scheme',
    image: {
      src: '/images/services/eu-settlement-scheme.webp',
      alt: 'The European Union flag',
      width: 900,
      height: 600,
    },
    category: 'eu-settlement-scheme',
    title: 'EU Settlement Scheme',
    shortTitle: 'EU Settlement Scheme',
    summary:
      'Advice on pre-settled and settled status, late applications, upgrading status and applications for family members.',
    icon: 'file-text',
    order: 7,
    intro: [
      'The EU Settlement Scheme continues to matter for people who hold pre-settled status, for family members joining a relevant sponsor, and for those who have reasonable grounds for applying late.',
      'The evidence needed is different in character from other routes, resting largely on residence in the UK over particular periods.',
    ],
    audience: [
      'Holders of pre-settled status moving to settled status',
      'Applicants with reasonable grounds for a late application',
      'Family members joining an eligible sponsor',
      'Applicants evidencing continuous residence',
      'Those who need to prove their status to an employer or landlord',
      'Applicants whose earlier application was refused',
    ],
    includes: [
      'Confirmation of which status you hold and what it permits',
      'A review of your residence evidence',
      'Advice on late applications and what counts as reasonable grounds',
      'Guidance on family member applications',
      'Help understanding and sharing your digital status',
      'Advice on any earlier refusal',
    ],
    sections: [
      {
        heading: 'Moving from pre-settled to settled status',
        body: [
          'Pre-settled status is time-limited. Moving to settled status generally requires a continuous qualifying period of residence, evidenced across the whole period rather than at either end of it.',
        ],
      },
      {
        heading: 'Late applications',
        body: [
          'Late applications are still possible where there are reasonable grounds for the delay. What counts is fact-specific, and the explanation needs to be supported rather than asserted.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I prove my status?',
        answer:
          'Status under the scheme is digital. You prove it by generating a share code through your UK Visas and Immigration account, which you then give to an employer, landlord or other checker.',
      },
      {
        question: 'What happens if my pre-settled status expires?',
        answer:
          'Take advice before it does. The position depends on your circumstances and on how long you have been resident, and it is far easier to address in advance.',
      },
    ],
    seo: {
      title: 'EU Settlement Scheme advice',
      description:
        'Advice on pre-settled and settled status, late applications, family member applications and proving your digital status.',
    },
  },
  {
    slug: 'business-immigration',
    image: {
      src: '/images/services/business-immigration.webp',
      alt: 'A city skyline seen from an office',
      width: 900,
      height: 600,
    },
    category: 'business',
    title: 'Business immigration',
    shortTitle: 'Business immigration',
    summary:
      'Support for employers building a compliant approach to sponsoring overseas workers, and for individuals on business routes.',
    icon: 'building',
    order: 8,
    intro: [
      'Employers who sponsor overseas workers take on duties that continue for as long as the sponsorship lasts. Getting the systems right at the outset is considerably easier than correcting them under scrutiny.',
      'We advise employers on what sponsorship involves in practice, and individuals on the business routes available to them.',
    ],
    audience: [
      'Employers considering sponsoring overseas workers',
      'HR teams reviewing existing sponsorship arrangements',
      'Businesses preparing for a compliance visit',
      'Employers with reporting duties they are unsure about',
      'Individuals exploring business and investment routes',
      'Organisations planning for growth in overseas recruitment',
    ],
    includes: [
      'An explanation of what sponsorship duties involve',
      'A review of your record-keeping against the published requirements',
      'Guidance on reporting duties and their deadlines',
      'Advice on right to work checks',
      'Practical preparation for compliance activity',
      'A view on which routes suit your recruitment plans',
    ],
    sections: [
      {
        heading: 'Sponsorship duties in practice',
        body: [
          'Holding a sponsor licence brings continuing duties: keeping specified records for each sponsored worker, reporting defined changes within set timescales, and cooperating with the Home Office.',
          'These duties fall on the organisation rather than on any one person, so they need to survive staff changes. We help you put that structure in place.',
        ],
      },
      {
        heading: 'Right to work checks',
        body: [
          'A correctly conducted right to work check provides a statutory excuse against a civil penalty. An incorrectly conducted one provides nothing at all, which is why the process matters as much as the outcome.',
        ],
      },
      {
        heading: 'Sponsor licence applications',
        body: [
          'Guidance on applying for a sponsor licence, assigning certificates of sponsorship and managing the sponsor management system will be published here once our regulatory authorisation for this work is confirmed.',
        ],
        requiresFeature: 'businessImmigration',
      },
      {
        heading: 'Business and investment routes',
        body: [
          'Detailed advice on the specific business, expansion and investment routes will be published here once our regulatory authorisation for this work is confirmed.',
        ],
        requiresFeature: 'businessImmigration',
      },
    ],
    faqs: [
      {
        question: 'What does a sponsor licence commit us to?',
        answer:
          'It commits the organisation to a set of continuing duties, principally record keeping, reporting and cooperation with the Home Office. We will set out what that means for a business of your size.',
      },
      {
        question: 'How should we prepare for a compliance visit?',
        answer:
          'By keeping the required records in order routinely rather than in response to a visit. We will review what you hold against the published requirements and tell you where the gaps are.',
      },
    ],
    seo: {
      title: 'Business immigration and sponsorship advice',
      description:
        'Advice for employers on sponsorship duties, record keeping, right to work checks and preparing for Home Office compliance activity.',
    },
  },
  {
    slug: 'complex-immigration-matters',
    image: {
      src: '/images/services/complex-immigration-matters.webp',
      alt: 'Reference books on a shelf',
      width: 900,
      height: 600,
    },
    category: 'complex-matters',
    title: 'Complex immigration matters',
    shortTitle: 'Complex matters',
    summary:
      'Advice on cases involving refusals, previous breaches and other circumstances requiring detailed consideration.',
    icon: 'scale',
    order: 9,
    requiresFeature: 'complexMatters',
    intro: [
      'Some cases turn on more than meeting a list of requirements. Refusals, previous breaches of immigration conditions and long or interrupted histories all need careful handling.',
      'This section will be published once our regulatory authorisation for this work is confirmed.',
    ],
    audience: [
      'Applicants with a previous refusal to address',
      'Cases involving earlier breaches of immigration conditions',
      'Long and interrupted immigration histories',
      'Applications requiring detailed written representations',
    ],
    includes: [
      'A full review of your immigration history',
      'An assessment of the difficulties in your case',
      'Advice on the options realistically open to you',
      'A clear explanation of where a matter falls outside our scope',
    ],
    sections: [
      {
        heading: 'Content pending authorisation',
        body: [
          'The detail of this service will be published once the practice confirms the regulatory level at which it is authorised to advise on these matters.',
        ],
      },
    ],
    faqs: [],
    seo: {
      title: 'Complex immigration matters',
      description: 'Advice on immigration cases requiring detailed consideration.',
    },
  },
];
