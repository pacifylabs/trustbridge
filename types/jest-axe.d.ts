/**
 * Ambient type declarations for jest-axe.
 *
 * The package ships no types of its own and there is no maintained
 * @types/jest-axe for version 11, so the small surface the test suite uses is
 * declared here rather than silencing the compiler with `any` at each call.
 *
 * This file must stay a script, not a module: a top-level import or export
 * would turn `declare module 'jest-axe'` into an augmentation of a module that
 * has no types to augment. Hence the inline `import('axe-core')` types below.
 */
declare module 'jest-axe' {
  type AxeResults = import('axe-core').AxeResults;
  type AxeResult = import('axe-core').Result;
  type RunOptions = import('axe-core').RunOptions;
  type Spec = import('axe-core').Spec;

  interface JestAxeConfigureOptions extends RunOptions {
    globalOptions?: Spec;
  }

  /** Runs axe against a DOM element or an HTML string. */
  function axe(html: Element | string, options?: JestAxeConfigureOptions): Promise<AxeResults>;

  function configureAxe(
    options?: JestAxeConfigureOptions,
  ): (html: Element | string, options?: JestAxeConfigureOptions) => Promise<AxeResults>;

  const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean;
      actual: readonly AxeResult[];
      message(): string;
    };
  };

  export { axe, configureAxe, toHaveNoViolations };
  export type { AxeResults, JestAxeConfigureOptions };
}
