'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  isTheme,
  prefersDarkNow,
  type Theme,
} from '@/lib/theme';
import { cn } from '@/lib/utils';

/**
 * Floating light and dark switch.
 *
 * One control, one action. Pressing it runs a single View Transition: the
 * outgoing theme is held still while the incoming one is revealed under a
 * circle growing from the button itself, so the page changes in one pass
 * rather than as a scatter of individual colour fades.
 *
 * Browsers without View Transitions apply the theme immediately, which is the
 * behaviour the site had before. Nothing here is required for the switch to
 * work, and the whole effect is skipped under prefers-reduced-motion.
 */

/*
  The applied theme is external state: the inline head script sets it before
  React exists, and another tab can change it. It is read through
  useSyncExternalStore so this component observes it rather than owning a
  second, drifting copy.
*/
const listeners = new Set<() => void>();

function notifyThemeChanged(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getAppliedTheme(): Theme {
  const attribute = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  if (isTheme(attribute)) return attribute;

  return prefersDarkNow() ? 'dark' : 'light';
}

/** The server and the hydration pass both render the light state. */
function getServerTheme(): Theme {
  return 'light';
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ThemeToggle({
  className,
  floating = false,
}: {
  className?: string;
  /** Pins the control to the right edge of the viewport, for large screens. */
  floating?: boolean;
}) {
  const theme = useSyncExternalStore(subscribe, getAppliedTheme, getServerTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === 'dark';
  const next: Theme = isDark ? 'light' : 'dark';

  // Another tab can change the stored preference; reflect it here.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isTheme(event.newValue)) return;
      document.documentElement.setAttribute(THEME_ATTRIBUTE, event.newValue);
      notifyThemeChanged();
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const applyTheme = useCallback((value: Theme) => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, value);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Preference will not persist. The theme still applies for this visit.
    }

    notifyThemeChanged();
  }, []);

  const onToggle = useCallback(() => {
    const root = document.documentElement;

    const startViewTransition = (
      document as Document & {
        startViewTransition?: (callback: () => void) => { finished: Promise<void> };
      }
    ).startViewTransition?.bind(document);

    if (!startViewTransition || prefersReducedMotion()) {
      applyTheme(next);
      return;
    }

    // Grow the reveal from the button, and size it to reach the furthest
    // corner so the circle always covers the page exactly once.
    const rect = buttonRef.current?.getBoundingClientRect();
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    root.style.setProperty('--tb-theme-origin-x', `${originX}px`);
    root.style.setProperty('--tb-theme-origin-y', `${originY}px`);
    root.style.setProperty('--tb-theme-radius', `${Math.ceil(radius)}px`);

    const transition = startViewTransition(() => {
      applyTheme(next);
    });

    void transition.finished.finally(() => {
      root.style.removeProperty('--tb-theme-origin-x');
      root.style.removeProperty('--tb-theme-origin-y');
      root.style.removeProperty('--tb-theme-radius');
    });
  }, [applyTheme, next]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      data-theme-toggle=""
      data-theme-state={theme}
      aria-pressed={isDark}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        'inline-grid shrink-0 place-items-center border border-border-subtle bg-surface text-strong',
        'transition-colors duration-200 ease-out hover:border-accent hover:text-accent-ink',
        floating
          ? 'fixed top-1/2 right-4 z-50 h-12 w-12 -translate-y-1/2 rounded-full shadow-lg backdrop-blur-md sm:right-6'
          : 'h-10 w-10 rounded-md',
        className,
      )}
    >
      {/*
        Both icons are always present and cross-fade against each other, so the
        control itself changes in the same single phase as the page behind it.
      */}
      <span className="relative block h-5 w-5">
        <Sun
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-300 ease-out',
            isDark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          )}
        />
        <Moon
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-300 ease-out',
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
          )}
        />
      </span>
    </button>
  );
}
