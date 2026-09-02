import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TestimonialSlider } from '@/components/blocks/TestimonialSlider';
import { DEV_TESTIMONIAL_SEEDS, HOME } from '@/content/pages';

/**
 * Testimonial slider.
 *
 * Exercised against `DEV_TESTIMONIAL_SEEDS` rather than `HOME.testimonials`:
 * the live content ships with no testimonials at all until the practice has
 * real, consented ones (see the compliance check below), so the seeds are
 * what stand in for "a populated slider" here.
 *
 * The compliance checks matter as much as the behavioural ones: a quote
 * saying an application succeeded would breach the outcome rule just as surely
 * as the site's own copy doing so, and these are the words most likely to be
 * replaced later by someone not thinking about that.
 */

describe('live content', () => {
  it('ships no testimonials until the practice supplies real, consented ones', () => {
    // A fabricated testimonial attributed to a real-sounding client is a
    // serious problem for a regulated advice practice, not a copy nitpick
    // (README rule 6) — mirrors the equivalent check on ADVISERS.
    expect(HOME.testimonials.items).toHaveLength(0);
  });
});

describe('content', () => {
  it('renders every quote', () => {
    render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    for (const item of DEV_TESTIMONIAL_SEEDS) {
      expect(screen.getByText(item.quote)).toBeInTheDocument();
    }
  });

  it('attributes each quote without publishing a full name', () => {
    render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    for (const item of DEV_TESTIMONIAL_SEEDS) {
      expect(screen.getByText(item.attribution)).toBeInTheDocument();
      // Attribution is by route and region, never "Firstname Lastname".
      expect(item.attribution).not.toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    }
  });

  it('states no outcome in any quote', () => {
    for (const item of DEV_TESTIMONIAL_SEEDS) {
      const text = item.quote.toLowerCase();

      expect(text, item.attribution).not.toMatch(/granted|approved|succeed|success/);
      expect(text, item.attribution).not.toMatch(/got me|won|guarantee/);
      expect(text, item.attribution).not.toMatch(/visa was|application was accepted/);
    }
  });

  it('renders nothing when there are no quotes', () => {
    const { container } = render(<TestimonialSlider items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('behaviour', () => {
  it('starts on the first quote', () => {
    const { container } = render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);
    const first = container.querySelectorAll('li[data-active]')[0];

    expect(first).toHaveAttribute('data-active', 'true');
  });

  it('disables the previous control on the first quote', () => {
    render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    expect(screen.getByRole('button', { name: 'Previous testimonial' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next testimonial' })).toBeEnabled();
  });

  it('offers both controls with accessible names', () => {
    render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    expect(screen.getByRole('button', { name: 'Previous testimonial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next testimonial' })).toBeInTheDocument();
  });

  it('keeps every quote in the document, not just the active one', () => {
    const { container } = render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    // A transform carousel typically removes or hides the off-screen slides.
    // This one scrolls, so all of them stay readable and in reading order.
    expect(container.querySelectorAll('blockquote')).toHaveLength(DEV_TESTIMONIAL_SEEDS.length);
    expect(container.querySelectorAll('[aria-hidden="true"] blockquote')).toHaveLength(0);
  });

  it('advances when the next control is pressed', async () => {
    const user = userEvent.setup();
    const { container } = render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);

    // jsdom does not lay out or scroll, so this asserts the control is wired
    // and does not throw; the real movement is covered by the browser tests.
    await user.click(screen.getByRole('button', { name: 'Next testimonial' }));
    expect(container.querySelector('[data-testid="testimonial-slider"]')).toBeTruthy();
  });

  it('pairs each quote with its attribution inside one card', () => {
    const { container } = render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);
    const [first] = DEV_TESTIMONIAL_SEEDS;
    const card = container.querySelectorAll('li')[0] as HTMLElement;

    expect(within(card).getByText(first!.quote)).toBeInTheDocument();
    expect(within(card).getByText(first!.attribution)).toBeInTheDocument();
    expect(within(card).getByText(first!.location)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<TestimonialSlider items={DEV_TESTIMONIAL_SEEDS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
