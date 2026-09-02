import type { Service } from '@/lib/content/types';

/**
 * Seeded service content.
 *
 * PRD §5 defines nine categories; all nine now have service pages.
 * Complex matters and business immigration are present but gated (README
 * rule 4).
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
      'Partner applications turn on evidence. The Home Office needs to see a genuine relationship, that you meet the financial requirement, and that your accommodation is in order.',
      'We work through each requirement with you, tell you what the caseworker expects, and help assemble a clear, focused bundle.',
    ],
    audience: [
      'Partners of British citizens applying from outside the UK',
      'Couples switching into the partner route from another visa',
      'Applicants extending partner leave before it expires',
      'Fiancés and proposed civil partners planning to marry in the UK',
    ],
    includes: [
      'Assessment of which partner route fits your circumstances',
      'Review of the financial requirement and supporting evidence',
      'Guidance on relationship evidence and what to include',
      'Review of your completed forms before submission',
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
      title: 'Spouse & Partner Visa Advice UK | TrustBridge',
      description:
        'Expert advice on UK spouse, civil partner, and unmarried partner visas. We guide you through financial requirements and relationship evidence.',
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
      'Visitor applications are refused more often than people expect. The decision rests entirely on whether the caseworker believes you will leave at the end of your stay.',
      'That judgement is made on the papers without an interview, so the application must answer the obvious questions before they are asked.',
    ],
    audience: [
      'Parents and relatives visiting family in the UK',
      'Business visitors attending meetings or conferences',
      'Applicants reapplying after a previous refusal',
      'Academics and researchers on short visits',
    ],
    includes: [
      'Review of your circumstances against the genuine visitor requirement',
      'Guidance on evidencing ties to your home country and funding',
      'Help preparing a clear covering letter and itinerary',
      'Considered response to any previous refusals',
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
      title: 'UK Visitor Visa Advice & Appeals | TrustBridge',
      description:
        'Professional advice for UK standard visitor visas, business trips, and strong reapplications following a previous refusal.',
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
      'The Skilled Worker route requires a sponsoring employer, a job at an eligible skill level, and a salary that meets the threshold and occupation code going rate.',
      'Most problems arise from the detail: the wrong occupation code, an incorrectly calculated salary, or a mismatched certificate of sponsorship.',
    ],
    audience: [
      'Workers with a certificate of sponsorship from a licensed employer',
      'Employees changing sponsor or moving to a new role',
      'Workers bringing partners and children as dependants',
      'Skilled Workers approaching eligibility for settlement',
    ],
    includes: [
      'Check of your role, occupation code and salary against requirements',
      'Review of the certificate of sponsorship before you apply',
      'Guidance on dependant applications made alongside yours',
      'Advice on continuity of leave when changing employer',
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
      title: 'UK Skilled Worker Visa Advice | TrustBridge',
      description:
        'Advice on UK Skilled Worker visas, including changing sponsors, occupation codes, salary thresholds, and dependants.',
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
      'The Health and Care Worker route is a distinct visa for medical and care professionals sponsored by an approved employer.',
      'Eligibility turns on your occupation code, your employer’s approval to sponsor on this route, and any necessary professional registration.',
    ],
    audience: [
      'Doctors, nurses and allied health professionals',
      'Adult social care workers sponsored by an approved provider',
      'Professionals awaiting or holding UK registration',
      'Workers extending leave or approaching settlement',
    ],
    includes: [
      'Confirmation that the role and employer qualify for this route',
      'Advice on professional registration requirements',
      'Review of salary against the going rate for the occupation code',
      'Guidance on dependant applications',
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
      title: 'Health and Care Worker Visa Advice | TrustBridge',
      description:
        'Expert guidance for health and social care professionals on UK visas, registration requirements, and dependants.',
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
      'Settlement is the point at which your right to live in the UK stops depending on a time-limited visa.',
      'The detail matters more here than almost anywhere else. Most difficulties come down to continuous residence rules, absences, or gaps between visas.',
    ],
    audience: [
      'Applicants completing five years on a work or partner route',
      'People with long residence in the UK',
      'Applicants with complex absences they are unsure about',
      'Anyone unsure when they become eligible for ILR',
    ],
    includes: [
      'Calculation of your qualifying period and eligibility date',
      'Review of absences against continuous residence rules',
      'Advice on the Life in the UK and English language tests',
      'Guidance on the effect of any gap in your leave',
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
      title: 'Settlement & ILR Advice UK | TrustBridge',
      description:
        'Secure your future in the UK. Advice on indefinite leave to remain (ILR), continuous residence, and absences.',
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
      'Citizenship is usually the final step after settlement. Naturalisation has its own distinct residence requirements, which are calculated differently from those for ILR.',
      'The good character requirement applies throughout and covers more than just criminal convictions, making full disclosure essential.',
    ],
    audience: [
      'Settled applicants naturalising as British citizens',
      'Parents registering a child as a British citizen',
      'Applicants with previous immigration breaches to address',
      'Those checking their absences before applying',
    ],
    includes: [
      'Calculation of residence and absences over the qualifying period',
      'Advice on the good character requirement and disclosures',
      'Guidance on referees and the required documentation',
      'Review of your application before final submission',
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
      title: 'British Citizenship & Naturalisation Advice | TrustBridge',
      description:
        'Professional advice on naturalising as a British citizen, registering children, and meeting the good character requirement.',
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
      'The EU Settlement Scheme remains vital for those holding pre-settled status, family members joining sponsors, and those with grounds for late applications.',
      'The evidence required is distinct from other routes, relying heavily on proving continuous residence in the UK over specific periods.',
    ],
    audience: [
      'Holders of pre-settled status moving to settled status',
      'Applicants with reasonable grounds for a late application',
      'Family members joining an eligible EU sponsor',
      'Applicants whose earlier EUSS application was refused',
    ],
    includes: [
      'Confirmation of your current status and what it permits',
      'Review of your continuous residence evidence',
      'Advice on late applications and reasonable grounds',
      'Guidance on applications for joining family members',
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
      title: 'EU Settlement Scheme Advice | TrustBridge',
      description:
        'Guidance on the EU Settlement Scheme, including pre-settled to settled status, late applications, and family members.',
    },
  },
  {
    slug: 'immigration-status-and-application-support',
    image: {
      src: '/images/services/immigration-status-and-application-support.webp',
      alt: 'A person reviewing documents at a desk',
      width: 1000,
      height: 671,
    },
    category: 'status-support',
    title: 'Immigration status and application support',
    shortTitle: 'Status and applications',
    summary:
      'General immigration consultations, eligibility assessments, application preparation and supporting document reviews across all routes.',
    icon: 'file-text',
    order: 8,
    intro: [
      'Not every enquiry fits neatly into a single route. Sometimes you need a strategic overview of your options before deciding which path to take.',
      'We handle the practical side: assessing eligibility, preparing forms and evidence, drafting cover letters, and reviewing changed circumstances.',
    ],
    audience: [
      'Anyone unsure which immigration route applies to them',
      'Applicants needing help preparing forms and supporting documents',
      'People whose immigration status is about to expire',
      'Applicants wanting an independent review before submitting',
    ],
    includes: [
      'Initial consultation to identify the best route for you',
      'Eligibility assessment against current Immigration Rules',
      'Preparation and review of application forms and evidence',
      'Drafting of cover letters and written representations',
    ],
    sections: [
      {
        heading: 'Immigration consultations and route assessments',
        body: [
          'A consultation is the starting point for most instructions. We go through your history, your current status and what you are trying to achieve, then set out which routes are realistically open to you and what each requires.',
          'You receive a written summary of the options discussed. You are under no obligation to proceed further.',
        ],
      },
      {
        heading: 'Application preparation',
        body: [
          'The difference between a well-prepared application and a poor one is rarely about the merits of the case. It is about whether the right evidence was submitted, in the right format, covering the right period.',
          'We work through the requirements with you, check what you have against what is needed, and tell you where the gaps are before you submit.',
        ],
      },
      {
        heading: 'Further Leave to Remain',
        body: [
          'If you already hold leave and need to extend or vary it, the timing and the basis of the new application both matter. We advise on when to apply, which route to apply under, and how the evidence requirements differ from your original application.',
        ],
      },
      {
        heading: 'Document reviews and cover letters',
        body: [
          'A document review checks what you plan to submit against what the rules require. A cover letter sets out how your evidence meets each requirement and draws attention to anything that needs explaining.',
          'Both are practical steps that improve the quality of the application without changing its substance.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need to know which visa route to apply for before contacting you?',
        answer:
          'No. That is often what the first consultation is for. Tell us your circumstances and what you are trying to achieve, and we will identify which routes apply.',
      },
      {
        question: 'Can you review an application I have already started preparing myself?',
        answer:
          'Yes. We can review your forms and supporting documents, tell you where there are gaps or weaknesses, and advise on what to add or change before you submit.',
      },
      {
        question: 'What is the difference between a consultation and full application preparation?',
        answer:
          'A consultation gives you an assessment of your options and what each involves. Application preparation means we work through the forms, evidence and submission with you. You can book a consultation first and decide afterwards whether to instruct us for the full preparation.',
      },
    ],
    seo: {
      title: 'Immigration Status & Application Support | TrustBridge',
      description:
        'General immigration consultations, eligibility assessments, document reviews, and application preparation across all UK routes.',
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
    order: 9,
    intro: [
      'Employers who sponsor overseas workers take on compliance duties that last as long as the sponsorship. Getting systems right early prevents serious issues later.',
      'We advise employers on practical sponsorship management, and guide individuals through specific business and investment routes.',
    ],
    audience: [
      'Employers considering sponsoring overseas workers',
      'HR teams preparing for a Home Office compliance visit',
      'Businesses unsure about their reporting duties',
      'Individuals exploring UK business and investment routes',
    ],
    includes: [
      'Review of your record-keeping against compliance requirements',
      'Guidance on reporting duties, deadlines, and right to work checks',
      'Practical preparation for Home Office compliance activity',
      'Strategic advice on which routes suit your recruitment plans',
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
          'We guide you through the process of applying for a sponsor licence, assigning certificates of sponsorship, and managing the sponsor management system to ensure compliance from day one.',
        ],
        requiresFeature: 'businessImmigration',
      },
      {
        heading: 'Business and investment routes',
        body: [
          'We provide detailed, strategic advice on specific business, expansion, and investment routes to help you achieve your commercial goals in the UK.',
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
      title: 'UK Business Immigration & Sponsorship Advice | TrustBridge',
      description:
        'Expert advice for employers on sponsor licences, compliance duties, right to work checks, and business immigration routes.',
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
    order: 10,
    requiresFeature: 'complexMatters',
    intro: [
      'Some cases require more than just meeting standard requirements. Previous refusals, breaches of conditions, and interrupted histories all need highly careful handling.',
      'We provide detailed analysis and strategic representation for complex matters that require advanced intervention.',
    ],
    audience: [
      'Applicants with a previous refusal to address',
      'Cases involving earlier breaches of immigration conditions',
      'Long and complicated immigration histories',
      'Applications requiring detailed written representations',
    ],
    includes: [
      'Full review of your immigration history and past refusals',
      'Assessment of the specific legal difficulties in your case',
      'Clear advice on the options realistically open to you',
      'Strategic representation and preparation of arguments',
    ],
    sections: [
      {
        heading: 'Strategic representation and appeals',
        body: [
          'We carefully assess complex histories, including prior refusals or breaches of conditions, to formulate a robust strategy for your case.',
          'Our representation involves meticulous preparation of evidence and legal arguments tailored to your unique circumstances.',
        ],
      },
    ],
    faqs: [],
    seo: {
      title: 'Complex UK Immigration Matters & Refusals | TrustBridge',
      description:
        'Strategic advice and representation for complex UK immigration cases, including previous refusals and breaches of conditions.',
    },
  },
];
