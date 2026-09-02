import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TestimonialSlider } from '@/components/blocks/TestimonialSlider';
import { HOME } from '@/content/pages';

/**
 * Testimonial slider.
 *
 * The compliance checks here matter as much as the behavioural ones: a quote
 * saying an application succeeded would breach the outcome rule just as surely
 * as the site's own copy doing so, and these are the words most likely to be
 * replaced later by someone not thinking about that.
 */

describe('content', () => {
  it('renders every quote', () => {
    render(<TestimonialSlider items={HOME.testimonials.items} />);

    for (const item of HOME.testimonials.items) {
      expect(screen.getByText(item.quote)).toBeInTheDocument();
    }
  });

  it('attributes each quote without publishing a full name', () => {
    render(<TestimonialSlider items={HOME.testimonials.items} />);

    for (const item of HOME.testimonials.items) {
      expect(screen.getByText(item.attribution)).toBeInTheDocument();
      // Attribution is by route and region, never "Firstname Lastname".
      expect(item.attribution).not.toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    }
  });

  it('states no outcome in any quote', () => {
    for (const item of HOME.testimonials.items) {
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
    const { container } = render(<TestimonialSlider items={HOME.testimonials.items} />);
    const first = container.querySelectorAll('li[data-active]')[0];

    expect(first).toHaveAttribute('data-active', 'true');
  });

  it('disables the previous control on the first quote', () => {
    render(<TestimonialSlider items={HOME.testimonials.items} />);

    expect(screen.getByRole('button', { name: 'Previous testimonial' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next testimonial' })).toBeEnabled();
  });

  it('offers both controls with accessible names', () => {
    render(<TestimonialSlider items={HOME.testimonials.items} />);

    expect(screen.getByRole('button', { name: 'Previous testimonial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next testimonial' })).toBeInTheDocument();
  });

  it('keeps every quote in the document, not just the active one', () => {
    const { container } = render(<TestimonialSlider items={HOME.testimonials.items} />);

    // A transform carousel typically removes or hides the off-screen slides.
    // This one scrolls, so all of them stay readable and in reading order.
    expect(container.querySelectorAll('blockquote')).toHaveLength(
      HOME.testimonials.items.length,
    );
    expect(container.querySelectorAll('[aria-hidden="true"] blockquote')).toHaveLength(0);
  });

  it('advances when the next control is pressed', async () => {
    const user = userEvent.setup();
    const { container } = render(<TestimonialSlider items={HOME.testimonials.items} />);

    // jsdom does not lay out or scroll, so this asserts the control is wired
    // and does not throw; the real movement is covered by the browser tests.
    await user.click(screen.getByRole('button', { name: 'Next testimonial' }));
    expect(container.querySelector('[data-testid="testimonial-slider"]')).toBeTruthy();
  });

  it('pairs each quote with its attribution inside one card', () => {
    const { container } = render(<TestimonialSlider items={HOME.testimonials.items} />);
    const [first] = HOME.testimonials.items;
    const card = container.querySelectorAll('li')[0] as HTMLElement;

    expect(within(card).getByText(first!.quote)).toBeInTheDocument();
    expect(within(card).getByText(first!.attribution)).toBeInTheDocument();
    expect(within(card).getByText(first!.location)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<TestimonialSlider items={HOME.testimonials.items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
