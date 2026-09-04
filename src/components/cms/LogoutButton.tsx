'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-small text-muted hover:text-accent-ink"
      onClick={async () => {
        await fetch('/api/cms/logout', { method: 'POST' });
        router.push('/cms/login');
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
