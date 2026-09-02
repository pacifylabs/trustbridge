import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CalendlyEmbed } from '@/components/blocks/CalendlyEmbed';

/**
 * Calendly embed.
 *
 * The widget is gated behind an explicit click so Calendly's own cookies are
 * never set just because a visitor loaded the /book page (see the component
 * for the reasoning). These tests cover that gate, not Calendly's iframe
 * itself, which jsdom cannot load anyway.
 */

const URL = 'https://calendly.com/trustbridge/consultation';

describe('CalendlyEmbed', () => {
  it('shows the placeholder, not the widget, before it is opened', () => {
    render(<CalendlyEmbed url={URL} />);

    expect(screen.getByTestId('calendly-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('calendly-embed')).not.toBeInTheDocument();
  });

  it('links to the cookie policy from the placeholder', () => {
    render(<CalendlyEmbed url={URL} />);
    expect(screen.getByRole('link', { name: /cookie policy/i })).toHaveAttribute(
      'href',
      '/legal/cookie-policy',
    );
  });

  it('loads the widget only once the visitor asks for it', async () => {
    const user = userEvent.setup();
    render(<CalendlyEmbed url={URL} />);

    await user.click(screen.getByRole('button', { name: /show available times/i }));

    expect(screen.getByTestId('calendly-embed')).toBeInTheDocument();
    expect(screen.queryByTestId('calendly-placeholder')).not.toBeInTheDocument();
  });

  it('passes the configured event URL to the widget container', async () => {
    const user = userEvent.setup();
    const { container } = render(<CalendlyEmbed url={URL} />);

    await user.click(screen.getByRole('button', { name: /show available times/i }));

    expect(container.querySelector('.calendly-inline-widget')).toHaveAttribute('data-url', URL);
  });

  it('has no detectable accessibility violations before or after loading', async () => {
    const user = userEvent.setup();
    const { container } = render(<CalendlyEmbed url={URL} />);

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: /show available times/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
