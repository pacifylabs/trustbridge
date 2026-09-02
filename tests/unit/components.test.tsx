import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Button } from '@/components/ui/Button';
import { Card, CardFooter } from '@/components/ui/Card';
import { TwoToneHeading } from '@/components/ui/TwoToneHeading';
import { StatBand } from '@/components/blocks/StatBand';
import { DisclaimerBlock } from '@/components/blocks/DisclaimerBlock';
import { ServiceGrid } from '@/components/blocks/ServiceCard';
import { AdviserCard } from '@/components/blocks/AdviserCard';
import { FaqList } from '@/components/blocks/FaqList';
import { CtaBand } from '@/components/blocks/CtaBand';
import { SERVICES } from '@/content/services';
import { DEV_ADVISER_SEEDS } from '@/content/advisers';
import { OUTCOME_DISCLAIMER, STATS } from '@/content/site';

/**
 * Component rendering.
 *
 * The card assertions check the structural rules the brief calls out: cards in
 * a group share one shell, so equal height, padding and radius come from a
 * single class list rather than from each usage site.
 */

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Send enquiry</Button>);
    const button = screen.getByRole('button', { name: 'Send enquiry' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders a link when given an href', () => {
    render(<Button href="/contact">Contact us</Button>);
    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact');
  });

  it('renders a plain anchor for external and protocol links', () => {
    render(<Button href="tel:+447417487423">Call us</Button>);
    expect(screen.getByRole('link', { name: 'Call us' })).toHaveAttribute(
      'href',
      'tel:+447417487423',
    );
  });

  it('gives every variant the same height and radius', () => {
    const variants = ['primary', 'accent', 'secondary', 'ghost', 'inverse'] as const;
    const classLists = variants.map((variant) => {
      const { container, unmount } = render(<Button variant={variant}>Label</Button>);
      const className = container.firstElementChild?.className ?? '';
      unmount();
      return className;
    });

    for (const className of classLists) {
      expect(className).toContain('min-h-11');
      expect(className).toContain('rounded-md');
    }
  });
});

describe('Card', () => {
  it('applies one shared shell to every card', () => {
    const { container } = render(
      <>
        <Card>Short</Card>
        <Card>A considerably longer piece of content than the first card holds.</Card>
      </>,
    );

    const cards = [...container.children];
    expect(cards).toHaveLength(2);

    for (const card of cards) {
      // h-full plus a column layout is what makes cards in a grid row match.
      expect(card.className).toContain('h-full');
      expect(card.className).toContain('flex-col');
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('p-6');
    }

    expect(cards[0]?.className).toBe(cards[1]?.className);
  });

  it('pushes the footer to the bottom so footers align across a row', () => {
    const { container } = render(
      <Card>
        <p>Body</p>
        <CardFooter>Learn more</CardFooter>
      </Card>,
    );

    const footer = within(container).getByText('Learn more');
    expect(footer.className).toContain('mt-auto');
  });
});

describe('TwoToneHeading', () => {
  it('keeps the accessible name as one continuous phrase', () => {
    render(<TwoToneHeading as="h1" lead="Immigration advice that is" emphasis="clear from the start" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Immigration advice that is clear from the start' }),
    ).toBeInTheDocument();
  });

  it('renders the emphasis in the accent colour', () => {
    render(<TwoToneHeading lead="Talk it through with" emphasis="an adviser" />);
    const emphasis = screen.getByText('an adviser');
    expect(emphasis.className).toContain('text-headline-emphasis');
  });

  it('renders without an emphasis clause', () => {
    render(<TwoToneHeading as="h2" lead="Spouse and partner visas" />);
    expect(screen.getByRole('heading', { name: 'Spouse and partner visas' })).toBeInTheDocument();
  });
});

describe('StatBand', () => {
  it('renders every stat with a label and detail', () => {
    render(<StatBand />);
    const band = screen.getByTestId('stat-band');

    for (const stat of STATS) {
      expect(within(band).getByText(stat.label)).toBeInTheDocument();
      expect(within(band).getByText(stat.detail)).toBeInTheDocument();
    }
  });

  it('publishes only figures that can be stood behind', () => {
    render(<StatBand />);
    const band = screen.getByTestId('stat-band');

    // There are no placeholder markers any more, so nothing in the band may
    // be a stand-in: every value has to be real or derived from the site.
    expect(screen.queryAllByTestId('stat-placeholder-marker')).toHaveLength(0);
    expect(band.textContent).not.toMatch(/TBC/);
    expect(band.textContent).not.toMatch(/to be confirmed/i);
    expect(band.textContent).not.toMatch(/awaiting/i);
  });

  it('publishes no success rate or client count', () => {
    render(<StatBand />);
    const text = screen.getByTestId('stat-band').textContent ?? '';

    expect(text).not.toMatch(/success rate/i);
    expect(text).not.toMatch(/approval/i);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/\d+\+\s*(clients|cases|applications)/i);
  });
});

describe('DisclaimerBlock', () => {
  it('renders the shared outcome wording verbatim', () => {
    render(<DisclaimerBlock />);
    const block = screen.getByTestId('outcome-disclaimer');

    expect(within(block).getByText(OUTCOME_DISCLAIMER.heading)).toBeInTheDocument();
    expect(within(block).getByText(OUTCOME_DISCLAIMER.body)).toBeInTheDocument();
  });

  it('states plainly that outcomes cannot be guaranteed', () => {
    render(<DisclaimerBlock />);
    expect(screen.getByTestId('outcome-disclaimer').textContent).toMatch(
      /no adviser can guarantee the result/i,
    );
  });
});

describe('ServiceGrid', () => {
  it('renders a card per service with a heading and a link', () => {
    const services = SERVICES.slice(0, 3);
    render(<ServiceGrid services={services} />);

    for (const service of services) {
      const link = screen.getByRole('link', { name: service.shortTitle });
      expect(link).toHaveAttribute('href', `/services/${service.slug}`);
      expect(screen.getByText(service.summary)).toBeInTheDocument();
    }
  });

  it('gives every card in the grid an identical shell', () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 4)} />);
    const items = [...container.querySelectorAll('li')];

    expect(items).toHaveLength(4);
    const first = items[0]?.className;
    for (const item of items) {
      expect(item.className).toBe(first);
    }
  });
});

describe('AdviserCard', () => {
  it('renders regulatory fields exactly as supplied', () => {
    const adviser = DEV_ADVISER_SEEDS[0]!;
    render(
      <ul>
        <AdviserCard adviser={adviser} />
      </ul>,
    );

    expect(screen.getByRole('heading', { name: adviser.name })).toBeInTheDocument();
    expect(screen.getByText(adviser.regulatoryLevel)).toBeInTheDocument();
    expect(screen.getByText(adviser.registrationNumber)).toBeInTheDocument();
  });

  it('shows no regulatory badge or claim of authorisation', () => {
    render(
      <ul>
        <AdviserCard adviser={DEV_ADVISER_SEEDS[0]!} />
      </ul>,
    );
    const text = document.body.textContent ?? '';

    expect(text).not.toMatch(/OISC/i);
    expect(text).not.toMatch(/regulated by/i);
    expect(text).not.toMatch(/authorised by/i);
  });
});

describe('FaqList', () => {
  it('renders each question as a disclosure', () => {
    const faqs = SERVICES[0]!.faqs;
    render(<FaqList faqs={faqs} />);

    for (const faq of faqs) {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    }
  });

  it('renders nothing when there are no questions', () => {
    const { container } = render(<FaqList faqs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('CtaBand', () => {
  it('uses the approved call to action labels', () => {
    render(<CtaBand />);
    expect(screen.getByRole('link', { name: 'Book a consultation' })).toHaveAttribute('href', '/book');
    expect(screen.getByRole('link', { name: 'Make an enquiry' })).toHaveAttribute('href', '/contact');
  });

  it('makes no promise about the outcome of an application', () => {
    render(<CtaBand />);
    const text = screen.getByTestId('cta-band').textContent ?? '';

    expect(text).not.toMatch(/guarantee/i);
    expect(text).not.toMatch(/success rate/i);
    expect(text).not.toMatch(/we will get you/i);
  });
});

describe('accessibility', () => {
  it('has no detectable violations in the stat band', async () => {
    const { container } = render(<StatBand />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no detectable violations in the disclaimer', async () => {
    const { container } = render(<DisclaimerBlock />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no detectable violations in the service grid', async () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 3)} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no detectable violations in the adviser card', async () => {
    // Rendered inside a list, matching how the team page uses it.
    const { container } = render(
      <ul>
        <AdviserCard adviser={DEV_ADVISER_SEEDS[0]!} />
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
