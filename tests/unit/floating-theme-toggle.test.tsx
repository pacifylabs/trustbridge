import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FloatingThemeToggle } from '@/components/layout/FloatingThemeToggle';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * Floating theme toggle.
 *
 * One control with one action, so the tests cover the switch itself, what it
 * announces, and the fallbacks: no View Transitions API, reduced motion, and
 * a localStorage that refuses to write.
 */

function mockMatchMedia({ dark = false, reducedMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark')
        ? dark
        : query.includes('prefers-reduced-motion')
          ? reducedMotion
          : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  });
}

beforeEach(() => {
  mockMatchMedia();
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  window.localStorage.clear();
  delete (document as Partial<Document> & { startViewTransition?: unknown }).startViewTransition;
});

describe('FloatingThemeToggle', () => {
  it('renders a single control, not a group of options', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    render(<FloatingThemeToggle />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('announces the action it will take, not the current state', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    render(<FloatingThemeToggle />);

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('switches to dark in one press', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('switches back on a second press', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light');
  });

  it('relabels itself after switching', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });
  });

  it('reports the switch state through aria-pressed', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('persists the choice', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('reflects the theme already applied by the head script', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    render(<FloatingThemeToggle />);

    expect(screen.getByRole('button')).toHaveAttribute('data-theme-state', 'dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('falls back to the operating system when no theme is applied', () => {
    mockMatchMedia({ dark: true });
    render(<FloatingThemeToggle />);

    expect(screen.getByRole('button')).toHaveAttribute('data-theme-state', 'dark');
  });

  it('still switches when localStorage throws', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    const user = userEvent.setup();
    render(<FloatingThemeToggle />);
    await user.click(screen.getByRole('button'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    setItem.mockRestore();
  });

  it('uses the View Transitions API when the browser has one', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');

    const startViewTransition = vi.fn((callback: () => void) => {
      callback();
      return { finished: Promise.resolve() };
    });
    Object.defineProperty(document, 'startViewTransition', {
      writable: true,
      configurable: true,
      value: startViewTransition,
    });

    const user = userEvent.setup();
    render(<FloatingThemeToggle />);
    await user.click(screen.getByRole('button'));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('skips the transition under reduced motion but still switches', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    mockMatchMedia({ reducedMotion: true });

    const startViewTransition = vi.fn();
    Object.defineProperty(document, 'startViewTransition', {
      writable: true,
      configurable: true,
      value: startViewTransition,
    });

    const user = userEvent.setup();
    render(<FloatingThemeToggle />);
    await user.click(screen.getByRole('button'));

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('switches without a View Transitions API at all', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const user = userEvent.setup();
    render(<FloatingThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('has no detectable accessibility violations', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    const { container } = render(<FloatingThemeToggle />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
