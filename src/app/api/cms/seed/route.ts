import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { seedSampleArticlesIfEmpty } from '@/lib/cms/articles';

/** One-off: loads the bundled sample articles so Resources is not empty on first switch-over. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
  }
  if (!isCmsConfigured()) {
    return NextResponse.json(
      { message: "This part of the site isn't set up yet. Please contact your website developer." },
      { status: 503 },
    );
  }

  const seeded = await seedSampleArticlesIfEmpty();
  if (seeded > 0) revalidatePath('/', 'layout');
  return NextResponse.json({ seeded });
}
