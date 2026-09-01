import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, expect, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

/*
  Testing Library waits one second by default. Several suites re-import modules
  with a fresh registry to exercise environment handling, which is heavy enough
  that a loaded worker can miss that window and fail a test that is not
  actually broken. The assertions are unchanged; only the patience is.
*/
configure({ asyncUtilTimeout: 5000 });

/**
 * Shared test setup.
 *
 * jsdom implements neither matchMedia nor IntersectionObserver, both of which
 * the theme toggle and the scroll reveals depend on. They are stubbed here so
 * component tests exercise the real code paths rather than skipping them.
 */

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  if (!('IntersectionObserver' in window)) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
  }
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.localStorage.clear();
});
