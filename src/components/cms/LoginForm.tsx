'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/cms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result: { message?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setMessage(result.message ?? 'Could not sign in.');
        return;
      }

      router.push('/cms/articles');
      router.refresh();
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please check your connection.');
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn('flex flex-col gap-4', className)}>
      <div>
        <label htmlFor="admin-password" className="text-small font-medium text-strong">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter the shared password"
            required
            className={cn(controlClasses, 'pr-11')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-strong"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {message ? (
        <p role="alert" className="text-small font-medium text-error">
          {message}
        </p>
      ) : null}

      <Button type="submit" variant="accent" className="justify-center" disabled={status === 'submitting'}>
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
