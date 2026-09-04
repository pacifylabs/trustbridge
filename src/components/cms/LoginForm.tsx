'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { controlClasses } from '@/components/ui/Field';
import { cn } from '@/lib/utils';

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
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
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          className={cn(controlClasses, 'mt-1.5')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
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
