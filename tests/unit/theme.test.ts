import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_PREFERENCE,
  THEMES,
  THEME_ATTRIBUTE,
  THEME_PREFERENCES,
  THEME_REGISTRY,
  isTheme,
  isThemePreference,
  resolveTheme,
  themeInitScript,
} from '@/lib/theme';

/**
 * Theme registry.
 *
 * The registry is the contract the token layer depends on, so these tests
 * guard the shape a restyle would rely on as much as the resolution logic.
 */

describe('theme registry', () => {
  it('ships light, dark and one alternate theme', () => {
    expect(THEMES).toStrictEqual(['light', 'dark', 'slate']);
    expect(THEME_REGISTRY.slate.isAlternate).toBe(true);
    expect(THEME_REGISTRY.light.isAlternate).toBe(false);
    expect(THEME_REGISTRY.dark.isAlternate).toBe(false);
  });

  it('has a registry entry for every theme', () => {
    for (const theme of THEMES) {
      expect(THEME_REGISTRY[theme]?.id).toBe(theme);
      expect(THEME_REGISTRY[theme]?.label).toBeTruthy();
    }
  });

  it('offers system alongside every concrete theme', () => {
    expect(THEME_PREFERENCES).toStrictEqual(['system', 'light', 'dark', 'slate']);
    expect(DEFAULT_THEME_PREFERENCE).toBe('system');
  });
});

describe('theme resolution', () => {
  it('follows the operating system when the preference is "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the operating system once a theme is chosen explicitly', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('slate', true)).toBe('slate');
  });
});

describe('theme guards', () => {
  it('accepts known values and rejects everything else', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme('midnight')).toBe(false);
    expect(isTheme(null)).toBe(false);

    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('slate')).toBe(true);
    expect(isThemePreference('midnight')).toBe(false);
  });
});

describe('anti-flash script', () => {
  it('sets the theme attribute and marks the document as scripted', () => {
    expect(themeInitScript).toContain(THEME_ATTRIBUTE);
    expect(themeInitScript).toContain("classList.add('js')");
  });

  it('falls back to light if storage throws', () => {
    expect(themeInitScript).toContain('catch');
    expect(themeInitScript).toContain("'light'");
  });

  it('runs without throwing when localStorage is unavailable', () => {
    const run = new Function(
      'localStorage',
      'window',
      'document',
      `${themeInitScript}; return document.documentElement.getAttribute('${THEME_ATTRIBUTE}');`,
    );

    const documentStub = { documentElement: { attributes: {} as Record<string, string>, classList: { add: () => {} }, setAttribute(name: string, value: string) { this.attributes[name] = value; }, getAttribute(name: string) { return this.attributes[name] ?? null; } } };
    const throwingStorage = { getItem: () => { throw new Error('blocked'); } };
    const windowStub = { matchMedia: () => ({ matches: false }) };

    expect(() => run(throwingStorage, windowStub, documentStub)).not.toThrow();
    expect(documentStub.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light');
  });
});
