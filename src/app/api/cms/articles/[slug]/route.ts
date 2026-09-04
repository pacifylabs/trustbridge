import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { deleteArticle, getArticleForAdmin, updateArticle } from '@/lib/cms/articles';
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

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  const article = await getArticleForAdmin(slug);
  if (!article) return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;

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
    const article = await updateArticle(slug, parsed.data);
    // Featured articles also render on the homepage, not just /resources.
    revalidatePath('/', 'layout');
    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the article.';
    return NextResponse.json({ message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  await deleteArticle(slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
