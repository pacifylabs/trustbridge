import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { createArticle, listAllArticles } from '@/lib/cms/articles';
import { articleInputSchema, collectArticleFieldErrors } from '@/lib/validation/article';

function unauthorized(): NextResponse {
  return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
}

function notConfigured(): NextResponse {
  return NextResponse.json(
    { message: "This part of the site isn't set up yet. Please contact your website developer." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const articles = await listAllArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  const parsed = articleInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please correct the highlighted fields.', fieldErrors: collectArticleFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const article = await createArticle(parsed.data);
    // Featured articles also render on the homepage, not just /resources.
    revalidatePath('/', 'layout');
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the article.';
    return NextResponse.json({ message }, { status: 409 });
  }
}
