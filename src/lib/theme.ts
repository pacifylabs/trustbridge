/**
 * Theme registry.
 *
 * Themes are declared here and implemented purely as CSS custom properties in
 * `src/styles/tokens.css`. No component holds a colour value, so restyling the
 * site for a client means editing one stylesheet and adding an entry below.
 */

export const THEMES = ['light', 'dark', 'slate'] as const;
export type Theme = (typeof THEMES)[number];

/** What the user can choose. "system" defers to the operating system. */
export const THEME_PREFERENCES = ['system', ...THEMES] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export interface ThemeDefinition {
  readonly id: Theme;
  readonly label: string;
  readonly description: string;
  /** Whether the theme reads as dark, used for the OS colour-scheme hint. */
  readonly appearance: 'light' | 'dark';
  /** Alternate themes are demonstrations of restyling, not part of the brand. */
  readonly isAlternate: boolean;
}

export const THEME_REGISTRY: Record<Theme, ThemeDefinition> = {
  light: {
    id: 'light',
    label: 'Light',
    description: 'Navy, cream and gold. The default brand presentation.',
    appearance: 'light',
    isAlternate: false,
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    description: 'Deep navy ground with lifted gold, designed as its own palette.',
    appearance: 'dark',
    isAlternate: false,
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    description: 'Alternate palette, included to demonstrate a full restyle.',
    appearance: 'light',
    isAlternate: true,
  },
};

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';
export const THEME_STORAGE_KEY = 'tb-theme';
export const THEME_ATTRIBUTE = 'data-theme';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** Resolves a stored preference to the theme actually applied to the document. */
/** The operating system's current colour preference, false where unknown. */
export function prefersDarkNow(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): Theme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light';
  return preference;
}

/**
 * Runs before first paint to stop a flash of the wrong theme. Kept as a
 * string so it can be inlined into <head>; it is deliberately small and
 * swallows storage errors, because a blocked localStorage must not break the
 * page render.
 *
 * It also marks the document as scripted. Scroll reveals are keyed off that
 * class, so without JavaScript every section renders fully visible rather than
 * staying stuck at opacity zero.
 */
export const themeInitScript = `(function(){try{
document.documentElement.classList.add('js');
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var stored=localStorage.getItem(k);
var valid=${JSON.stringify(THEME_PREFERENCES)};
var pref=valid.indexOf(stored)>-1?stored:'system';
var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;
var theme=pref==='system'?(dark?'dark':'light'):pref;
document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},theme);
}catch(e){document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},'light');}})();`;
