'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ConfirmOptions {
  /** Defaults to "Please confirm". */
  readonly title?: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** "danger" is for anything destructive or irreversible — a delete, mainly. */
  readonly tone?: 'default' | 'danger';
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Replaces the browser's native `confirm()` across the CMS with one
 * consistently styled dialog, so "are you sure?" always looks and reads the
 * same whatever action triggered it.
 *
 * `confirm()` is synchronous; this isn't — it returns a promise that
 * resolves once the editor picks an option, so call sites just add `await`
 * in front of what used to be a plain `confirm(...)` call.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    const normalized = typeof next === 'string' ? { message: next } : next;
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(normalized);
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  useEffect(() => {
    if (!options) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-6 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  options.tone === 'danger' ? 'bg-error/10 text-error' : 'bg-accent-soft text-accent-ink',
                )}
                aria-hidden="true"
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 id="confirm-dialog-title" className="text-h4 text-strong">
                  {options.title ?? 'Please confirm'}
                </h2>
                <p
                  id="confirm-dialog-message"
                  className="mt-2 text-small leading-relaxed whitespace-pre-line text-muted"
                >
                  {options.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => close(false)}>
                {options.cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                type="button"
                variant="accent"
                className={options.tone === 'danger' ? 'bg-error text-white hover:bg-error/90' : undefined}
                onClick={() => close(true)}
              >
                {options.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

/** Returns a `confirm(message | options)` function that resolves to true/false, replacing window.confirm. */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider (the /cms protected layout provides one).');
  }
  return confirm;
}
