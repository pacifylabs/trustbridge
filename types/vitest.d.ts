/**
 * Registers the jest-axe matcher with Vitest's assertion types.
 *
 * Kept separate from the ambient jest-axe declaration because module
 * augmentation requires this file to be a module, which that one must not be.
 * The jest-dom matchers augment Vitest themselves, via the
 * '@testing-library/jest-dom/vitest' import in tests/setup.ts.
 */
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }

  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
