import { promises as fs } from 'fs';
import path from 'path';
import { requireAuth } from '../requireAuth.js';
import { uploadMedia, deleteMedia, listMedia } from '../blob.js';
import { logActivity } from '../db.js';

/**
 * /api/cms/media
 * Protected Media Library API
 * Lists local repository assets + Vercel Blob cloud uploads,
 * and handles new asset uploads & deletions.
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  const method = req.method;

  // ── GET: List all media assets ───────────────────────────
  if (method === 'GET') {
    try {
      const media = [];
      const cwd = process.cwd();

      // 1. Scan public/assets/Resource/
      const resourceDir = path.join(cwd, 'public', 'assets', 'Resource');
      try {
        const files = await fs.readdir(resourceDir);
        for (const f of files) {
          if (f.startsWith('.')) continue;
          const stat = await fs.stat(path.join(resourceDir, f));
          if (stat.isFile()) {
            media.push({
              url: `/assets/Resource/${encodeURIComponent(f)}`,
              name: f,
              category: 'Books & Covers',
              size: stat.size,
              updatedAt: stat.mtime,
              isBlob: false,
            });
          }
        }
      } catch (err) {
        console.warn('[CMS Media] Could not read Resource dir:', err.message);
      }

      // 2. Scan public/assets/logos/
      const logosDir = path.join(cwd, 'public', 'assets', 'logos');
      try {
        const files = await fs.readdir(logosDir);
        for (const f of files) {
          if (f.startsWith('.')) continue;
          const stat = await fs.stat(path.join(logosDir, f));
          if (stat.isFile()) {
            media.push({
              url: `/assets/logos/${encodeURIComponent(f)}`,
              name: f,
              category: 'Logos & Brand',
              size: stat.size,
              updatedAt: stat.mtime,
              isBlob: false,
            });
          }
        }
      } catch (err) {
        console.warn('[CMS Media] Could not read logos dir:', err.message);
      }

      // 3. Check Vercel Blob uploads if token is present
      const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
      if (hasBlobToken) {
        try {
          const blobs = await listMedia();
          blobs.forEach(b => {
            media.unshift({
              url: b.url,
              name: b.pathname.split('/').pop() || b.pathname,
              category: 'Cloud Uploads',
              size: b.size,
              updatedAt: b.uploadedAt,
              isBlob: true,
            });
          });
        } catch (blobErr) {
          console.warn('[CMS Media] Blob list error:', blobErr.message);
        }
      }

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        media,
        hasBlobToken,
        total: media.length,
      });
    } catch (err) {
      console.error('[CMS Media] GET error:', err);
      return res.status(500).json({ error: 'Failed to scan media directory.' });
    }
  }

  // ── POST: Upload new asset ───────────────────────────────
  if (method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { filename, fileData, contentType } = body;

      if (!filename || !fileData) {
        return res.status(400).json({ error: 'Filename and base64 fileData are required for upload.' });
      }

      const buffer = Buffer.from(fileData, 'base64');

      // Server-side safety guard: reject print-scale assets (> 4 MB)
      const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
      if (buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(400).json({
          error: 'Asset is too large (' + (buffer.length / (1024 * 1024)).toFixed(1) + ' MB). Maximum allowed upload is 4 MB. Please export a web-optimized version (under 1200px width in WebP/JPEG) from Illustrator or CorelDraw.'
        });
      }

      const cleanName = 'edubuds-' + Date.now() + '-' + filename.toLowerCase().replace(/[^a-z0-9._-]/g, '-');

      // 1. Cloud storage via Vercel Blob (preferred for production)
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await uploadMedia(cleanName, buffer, {
          contentType: contentType || 'image/png',
          access: 'public',
        });

        await logActivity('upload_media', 'media', blob.url, {
          filename: cleanName,
          by: user.username,
        });

        return res.status(201).json({
          ok: true,
          message: 'File uploaded to Vercel Blob successfully!',
          media: {
            url: blob.url,
            name: cleanName,
            category: 'Cloud Uploads',
            size: buffer.length,
            isBlob: true,
          },
        });
      }

      // 2. Local fallback if BLOB_READ_WRITE_TOKEN is not configured
      try {
        const cwd = process.cwd();
        const localTarget = path.join(cwd, 'public', 'assets', 'Resource', cleanName);
        await fs.writeFile(localTarget, buffer);
        const localUrl = '/assets/Resource/' + encodeURIComponent(cleanName);

        await logActivity('upload_media', 'media', localUrl, {
          filename: cleanName,
          by: user.username,
        });

        return res.status(201).json({
          ok: true,
          message: 'File saved locally to /assets/Resource/! (Add BLOB_READ_WRITE_TOKEN in Vercel for cloud delivery)',
          media: {
            url: localUrl,
            name: cleanName,
            category: 'Books & Covers',
            size: buffer.length,
            isBlob: false,
          },
        });
      } catch (fsErr) {
        // In Vercel Serverless environment, local filesystem is read-only.
        // Fallback to inline web-optimized data URL so data entry is never blocked.
        if (buffer.length <= 2 * 1024 * 1024) {
          const mime = contentType || 'image/png';
          const dataUrl = `data:${mime};base64,${fileData}`;

          await logActivity('upload_media', 'media', cleanName, {
            filename: cleanName,
            format: 'data_url',
            by: user.username,
          });

          return res.status(201).json({
            ok: true,
            message: 'Image saved directly to book! (Tip: Connect Vercel Blob in Vercel Project Settings for high-speed CDN delivery)',
            media: {
              url: dataUrl,
              name: cleanName,
              category: 'Books & Covers',
              size: buffer.length,
              isBlob: false,
            },
          });
        }

        return res.status(400).json({
          error: 'Cloud storage is not configured for large files (> 2 MB). Please connect Vercel Blob in your Vercel Project Settings.',
        });
      }
    } catch (err) {
      console.error('[CMS Media] POST upload error:', err);
      return res.status(500).json({ error: err.message || 'Media upload failed.' });
    }
  }

  // ── DELETE: Delete cloud media ───────────────────────────
  if (method === 'DELETE') {
    try {
      const url = req.query?.url || req.body?.url;
      if (!url) {
        return res.status(400).json({ error: 'Media URL is required for deletion.' });
      }

      // Local files in git/public repo cannot be deleted over serverless
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return res.status(400).json({
          error: 'Built-in local repository assets are read-only. Only cloud uploaded media can be deleted.',
        });
      }

      await deleteMedia(url);
      await logActivity('delete_media', 'media', url, { by: user.username });

      return res.status(200).json({ ok: true, message: 'Cloud media deleted successfully.' });
    } catch (err) {
      console.error('[CMS Media] DELETE error:', err);
      return res.status(500).json({ error: err.message || 'Failed to delete media.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: `Method ${method} not allowed.` });
}
