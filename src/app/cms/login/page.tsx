import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasAdminSession } from '@/lib/cms/auth';
import { LoginForm } from '@/components/cms/LoginForm';

export const metadata: Metadata = {
  title: 'CMS sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect('/cms/articles');

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface-sunken px-4">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-8 shadow-sm">
        <p className="text-micro font-semibold tracking-[0.14em] text-accent-ink uppercase">
          TrustBridge CMS
        </p>
        <h1 className="mt-2 text-h3 text-strong">Sign in</h1>
        <p className="mt-2 text-small text-muted">Enter the shared editor password to continue.</p>
        <LoginForm className="mt-6" />
      </div>
    </main>
  );
}
