import { NextResponse, type NextRequest } from 'next/server';
import { isBlobConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { BlobUploadError, uploadImage, type UploadFolder } from '@/lib/cms/blob';

const FOLDERS: readonly UploadFolder[] = ['articles', 'advisers', 'services', 'legal'];

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
  }
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { message: "Photo and image uploads aren't set up yet. Please contact your website developer." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folderInput = formData.get('folder');
  const folder = FOLDERS.includes(folderInput as UploadFolder) ? (folderInput as UploadFolder) : 'articles';

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No image was submitted.' }, { status: 400 });
  }

  try {
    const uploaded = await uploadImage(file, folder);
    return NextResponse.json(uploaded);
  } catch (error) {
    if (error instanceof BlobUploadError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }
    return NextResponse.json({ message: 'Could not upload the image.' }, { status: 500 });
  }
}
