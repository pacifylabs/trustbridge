import type { Article } from '@/lib/content/types';

/**
 * Seeded articles.
 *
 * These are demonstration pieces about how the practice works, not immigration
 * guidance. That is deliberate: specimen guidance written before the client has
 * approved it could be read as advice, which is not a risk worth taking to
 * prove that a card grid renders.
 *
 * `body` is HTML, matching what the CMS's rich-text editor produces and what
 * the public article page renders directly (sanitized again on the way in,
 * see `lib/sanitize.ts`) — these read exactly the way a real CMS-authored
 * article would.
 *
 * Every entry is marked `isSample`. They are also what the CMS's "Import
 * starter content" button loads into Redis the first time it runs.
 */
export const ARTICLES: readonly Article[] = [
  {
    slug: 'what-to-expect-at-your-first-consultation',
    image: {
      src: '/images/articles/what-to-expect-at-your-first-consultation.webp',
      alt: 'Two people talking across a table',
      width: 1000,
      height: 560,
    },
    title: 'What to expect at your first consultation',
    excerpt:
      'A short guide to how the first meeting works, what to bring, and what you will have by the end of it.',
    category: 'Working with us',
    publishedAt: '2026-07-14',
    author: 'TrustBridge Immigration Services',
    readingMinutes: 4,
    status: 'published',
    isSample: true,
    body:
      '<p>The first consultation exists to answer one question: what are your realistic options, and what would each of them involve? Everything else follows from that.</p>' +
      '<h2>Before the meeting</h2>' +
      '<p>Send us what you already have. Passports, previous visas, refusal notices and any correspondence from the Home Office are the most useful, because they establish your immigration history rather than relying on recollection.</p>' +
      '<p>If you cannot find something, say so. An incomplete picture that we know is incomplete is far more workable than one we believe to be complete.</p>' +
      '<h2>During the meeting</h2>' +
      '<p>We will take you through your history, identify the routes that are open to you, and explain what each requires. Where we can see a difficulty, we will say so at the time rather than later.</p>' +
      '<ul>' +
      '<li>Your immigration history and current status</li>' +
      '<li>The routes available and what each requires</li>' +
      '<li>The evidence you would need to gather</li>' +
      '<li>Any weaknesses we can see, and how they might be addressed</li>' +
      '<li>What the process would cost and roughly how long it takes</li>' +
      '</ul>' +
      '<h2>Afterwards</h2>' +
      '<p>Where appropriate, you will receive confirmation of the key advice, options or next steps discussed. You are under no obligation to instruct us further. If you decide to proceed, that becomes the starting point for the work.</p>' +
      '<p>What we will not do is tell you an application is certain to succeed. Decisions rest with the Home Office, and any adviser who promises otherwise is not being straight with you.</p>',
    seo: {
      title: 'What to expect at your first consultation',
      description:
        'How a first immigration consultation with TrustBridge works, what to bring, and what you receive afterwards.',
    },
  },
  {
    slug: 'how-we-handle-your-documents',
    image: {
      src: '/images/articles/how-we-handle-your-documents.webp',
      alt: 'Writing at a tidy desk',
      width: 914,
      height: 512,
    },
    title: 'How we handle your documents',
    excerpt:
      'Immigration cases involve sensitive personal information. Here is how we store it, who can see it, and how long we keep it.',
    category: 'Working with us',
    publishedAt: '2026-06-30',
    author: 'TrustBridge Immigration Services',
    readingMinutes: 3,
    status: 'published',
    isSample: true,
    body:
      '<p>An immigration file holds more sensitive information than most people realise: identity documents, financial records, medical details, and sometimes an account of difficult personal circumstances. How that material is handled matters.</p>' +
      '<h2>What we ask for</h2>' +
      '<p>We ask for what the application requires and no more. Where a document would strengthen your case but is not strictly required, we will explain why we are asking so you can decide.</p>' +
      '<h2>How it is stored</h2>' +
      '<p>Enquiry details submitted through this website are sent directly to our secure inbox. Case files are held on access-controlled systems, and only those working on your matter have access to them.</p>' +
      '<h2>How long we keep it</h2>' +
      '<p>We keep records for a defined period after a matter concludes, then delete them. You can ask us at any time what we hold about you, and you can ask us to delete it, subject to any period we are required to retain records for.</p>' +
      '<p>Our privacy policy sets out the detail, including the lawful basis on which we process your information and how to make a request.</p>',
    seo: {
      title: 'How we handle your documents',
      description:
        'How TrustBridge collects, stores and retains the personal information involved in an immigration matter.',
    },
  },
  {
    slug: 'where-home-office-fees-are-published',
    image: {
      src: '/images/articles/where-home-office-fees-are-published.webp',
      alt: 'Coins',
      width: 1000,
      height: 560,
    },
    title: 'Where Home Office fees are published',
    excerpt:
      'Application fees change, and they are not the only cost. A short note on where to find the current figures and what else to budget for.',
    category: 'Guides',
    publishedAt: '2026-06-09',
    author: 'TrustBridge Immigration Services',
    readingMinutes: 3,
    status: 'published',
    isSample: true,
    body:
      '<p>Home Office application fees are set by regulations and revised periodically. Because they change, we do not reproduce them here: a figure copied onto a website has a habit of staying there long after it stopped being correct.</p>' +
      '<h2>Where to look</h2>' +
      '<p>The current fees for all immigration and nationality applications are published on GOV.UK. That page is the authoritative source, and it is the one we check before quoting anything to a client.</p>' +
      '<h2>What else to budget for</h2>' +
      '<ul>' +
      '<li>The immigration health surcharge, where it applies to your route</li>' +
      '<li>Biometric enrolment, and any appointment upgrade you choose</li>' +
      '<li>Certified translations of documents not in English or Welsh</li>' +
      '<li>The English language test and the Life in the UK test, where required</li>' +
      '<li>Priority or super priority services, if you opt for them</li>' +
      '<li>Professional fees for the advice and preparation itself</li>' +
      '</ul>' +
      '<h2>A note on priority services</h2>' +
      '<p>Priority services affect the order in which an application is looked at. They do not affect the decision, and they are not always available. Whether they are worth the cost depends on your circumstances rather than on the application itself.</p>',
    seo: {
      title: 'Where Home Office fees are published',
      description:
        'Where to find current UK immigration application fees, and the other costs to budget for alongside them.',
    },
  },
];
