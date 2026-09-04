import { put } from '@vercel/blob';
import { env, isBlobConfigured } from '@/lib/env';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type UploadFolder = 'articles' | 'advisers' | 'services';

export interface UploadedImage {
  readonly url: string;
}

export class BlobUploadError extends Error {}

/** Uploads an image to Vercel Blob, under a folder per content type. Throws on anything it will not store. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadedImage> {
  if (!isBlobConfigured()) {
    throw new BlobUploadError("Photo and image uploads aren't set up yet. Please contact your website developer.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new BlobUploadError('Please upload a JPEG, PNG or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    throw new BlobUploadError('Please upload an image under 5MB.');
  }

  const extension = file.type.split('/')[1];
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const blob = await put(path, file, {
    access: 'public',
    token: env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return { url: blob.url };
}
