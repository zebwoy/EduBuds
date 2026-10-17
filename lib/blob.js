import { put, del, list } from '@vercel/blob';

/**
 * EduBuds Media Storage Helper (Vercel Blob)
 * Handles uploading book assets, samples, and illustrations for the CMS.
 */

export async function uploadMedia(filename, fileBody, options = {}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured in environment variables.');
  }

  const blob = await put(filename, fileBody, {
    access: 'public',
    token,
    ...options,
  });

  return blob;
}

export async function deleteMedia(url) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
  }

  return await del(url, { token });
}

export async function listMedia(prefix = '') {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];

  const { blobs } = await list({ prefix, token });
  return blobs;
}
