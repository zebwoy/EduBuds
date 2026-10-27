import { requireAuth } from '../../lib/requireAuth.js';
import { getAllSeries, getSeriesById, upsertSeries, deleteSeries, logActivity } from '../../lib/db.js';

/**
 * /api/cms/series
 * CRUD API for Book Series
 * Protected — requires valid admin JWT.
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  const method = req.method;

  // ── GET: List all series or get single by ?id ────────────
  if (method === 'GET') {
    try {
      const { id } = req.query || {};
      if (id) {
        const item = await getSeriesById(id);
        if (!item) return res.status(404).json({ error: 'Series not found.' });
        return res.status(200).json({ series: item });
      }

      const list = await getAllSeries();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ series: list });
    } catch (err) {
      console.error('[CMS Series] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch series.' });
    }
  }

  // ── POST: Create new series ──────────────────────────────
  if (method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { label, tagline, description, color, colorLight, color_light, orderIndex, order_index } = body;

      if (!label || typeof label !== 'string' || !label.trim()) {
        return res.status(400).json({ error: 'Series label is required.' });
      }

      // Generate or clean ID slug
      let id = body.id;
      if (!id || typeof id !== 'string' || !id.trim()) {
        id = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      } else {
        id = id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      }

      const saved = await upsertSeries({
        id,
        label: label.trim(),
        tagline: tagline || '',
        description: description || '',
        color: color || '#0878c9',
        colorLight: colorLight || color_light || '#e7f2ff',
        orderIndex: orderIndex ?? order_index ?? 0,
      });

      await logActivity('create_series', 'series', saved.id, {
        label: saved.label,
        by: user.username,
      });

      return res.status(201).json({ ok: true, message: 'Series created successfully.', series: saved });
    } catch (err) {
      console.error('[CMS Series] POST error:', err);
      return res.status(500).json({ error: 'Failed to create series.' });
    }
  }

  // ── PUT: Update existing series ──────────────────────────
  if (method === 'PUT') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { id, label, tagline, description, color, colorLight, color_light, orderIndex, order_index } = body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Series ID is required for update.' });
      }
      if (!label || typeof label !== 'string' || !label.trim()) {
        return res.status(400).json({ error: 'Series label is required.' });
      }

      const existing = await getSeriesById(id);
      if (!existing) {
        return res.status(404).json({ error: `Series with ID "${id}" does not exist.` });
      }

      const saved = await upsertSeries({
        id,
        label: label.trim(),
        tagline: tagline !== undefined ? tagline : existing.tagline,
        description: description !== undefined ? description : existing.description,
        color: color || existing.color,
        colorLight: colorLight || color_light || existing.colorLight,
        orderIndex: orderIndex ?? order_index ?? existing.orderIndex,
      });

      await logActivity('update_series', 'series', saved.id, {
        label: saved.label,
        by: user.username,
      });

      return res.status(200).json({ ok: true, message: 'Series updated successfully.', series: saved });
    } catch (err) {
      console.error('[CMS Series] PUT error:', err);
      return res.status(500).json({ error: 'Failed to update series.' });
    }
  }

  // ── DELETE: Remove series ────────────────────────────────
  if (method === 'DELETE') {
    try {
      const id = req.query?.id || req.body?.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Series ID is required for deletion.' });
      }

      await deleteSeries(id);
      await logActivity('delete_series', 'series', id, { by: user.username });

      return res.status(200).json({ ok: true, message: `Series "${id}" deleted successfully.` });
    } catch (err) {
      console.error('[CMS Series] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete series.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${method} not allowed.` });
}
