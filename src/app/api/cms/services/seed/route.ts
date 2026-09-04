import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { seedServicesIfEmpty } from '@/lib/cms/services';

/** One-off: loads the service pages already live on the site so editors can start changing them. */
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

  const seeded = await seedServicesIfEmpty();
  if (seeded > 0) revalidatePath('/', 'layout');
  return NextResponse.json({ seeded });
}
