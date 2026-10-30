import { requireAuth } from '../requireAuth.js';
import { getAllBooks, getBookById, upsertBook, deleteBook, toggleBookPublish, logActivity } from '../db.js';

/**
 * /api/cms/books
 * CRUD API for Individual Books
 * Protected — requires valid admin JWT.
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  const method = req.method;

  // ── GET: List all books, filter by series, or get by ID ──
  if (method === 'GET') {
    try {
      const { id, series_id, seriesId } = req.query || {};
      if (id) {
        const item = await getBookById(id);
        if (!item) return res.status(404).json({ error: 'Book not found.' });
        return res.status(200).json({ book: item });
      }

      const list = await getAllBooks(series_id || seriesId || null);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ books: list });
    } catch (err) {
      console.error('[CMS Books] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch books.' });
    }
  }

  // ── POST: Create new book ────────────────────────────────
  if (method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const {
        title, subtitle, seriesId, series_id,
        image, tags, description, whatsappMessage, whatsapp_message,
        isPublished, is_published, orderIndex, order_index
      } = body;

      const targetSeriesId = seriesId || series_id;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Book title is required.' });
      }
      if (!targetSeriesId || typeof targetSeriesId !== 'string') {
        return res.status(400).json({ error: 'Series selection is required.' });
      }

      // Generate or clean ID slug
      let id = body.id;
      if (!id || typeof id !== 'string' || !id.trim()) {
        const titleSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const subSlug = subtitle ? '-' + subtitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
        id = `${targetSeriesId}-${titleSlug}${subSlug}`.slice(0, 60);
      } else {
        id = id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      }

      // Default WhatsApp message if blank
      let waMsg = whatsappMessage || whatsapp_message;
      if (!waMsg || !waMsg.trim()) {
        const fullTitle = `${title.trim()}${subtitle ? ' (' + subtitle.trim() + ')' : ''}`;
        waMsg = `Assalamu Alaikum! I am interested in ordering the EduBuds "${fullTitle}". Could you please share details on pricing, availability, and how to place an order?`;
      }

      const saved = await upsertBook({
        id,
        seriesId: targetSeriesId,
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        image: image ? image.trim() : '/assets/Resource/Grade 1 Cover.jpg',
        tags: tags || [],
        description: description ? description.trim() : '',
        whatsappMessage: waMsg.trim(),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : (is_published !== undefined ? Boolean(is_published) : true),
        orderIndex: orderIndex ?? order_index ?? 0,
      });

      await logActivity('create_book', 'books', saved.id, {
        title: saved.title,
        seriesId: targetSeriesId,
        by: user.username,
      });

      return res.status(201).json({ ok: true, message: 'Book added successfully.', book: saved });
    } catch (err) {
      console.error('[CMS Books] POST error:', err);
      return res.status(500).json({ error: 'Failed to create book.' });
    }
  }

  // ── PUT: Update book or toggle publication ───────────────
  if (method === 'PUT') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { id } = body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Book ID is required for update.' });
      }

      const existing = await getBookById(id);
      if (!existing) {
        return res.status(404).json({ error: `Book with ID "${id}" does not exist.` });
      }

      // Quick toggle action
      if (body.action === 'toggle_publish' || (body.isPublished !== undefined && Object.keys(body).length <= 3)) {
        const nextState = body.isPublished !== undefined ? body.isPublished : !existing.isPublished;
        const toggled = await toggleBookPublish(id, nextState);
        await logActivity('toggle_book_publish', 'books', id, { isPublished: nextState, by: user.username });
        return res.status(200).json({ ok: true, message: 'Publication status updated.', book: toggled });
      }

      // Full update
      const targetSeriesId = body.seriesId || body.series_id || existing.seriesId;
      const title = body.title !== undefined ? body.title : existing.title;
      const subtitle = body.subtitle !== undefined ? body.subtitle : existing.subtitle;
      const image = body.image !== undefined ? body.image : existing.image;
      const tags = body.tags !== undefined ? body.tags : existing.tags;
      const description = body.description !== undefined ? body.description : existing.description;
      const whatsappMessage = body.whatsappMessage || body.whatsapp_message || existing.whatsappMessage;
      const isPublished = body.isPublished !== undefined ? body.isPublished : existing.isPublished;
      const orderIndex = body.orderIndex ?? body.order_index ?? existing.orderIndex;

      const saved = await upsertBook({
        id,
        seriesId: targetSeriesId,
        title: String(title).trim(),
        subtitle: String(subtitle || '').trim(),
        image: String(image || '').trim(),
        tags,
        description: String(description || '').trim(),
        whatsappMessage: String(whatsappMessage || '').trim(),
        isPublished: Boolean(isPublished),
        orderIndex: Number(orderIndex) || 0,
      });

      await logActivity('update_book', 'books', saved.id, {
        title: saved.title,
        by: user.username,
      });

      return res.status(200).json({ ok: true, message: 'Book updated successfully.', book: saved });
    } catch (err) {
      console.error('[CMS Books] PUT error:', err);
      return res.status(500).json({ error: 'Failed to update book.' });
    }
  }

  // ── DELETE: Remove book ──────────────────────────────────
  if (method === 'DELETE') {
    try {
      const id = req.query?.id || req.body?.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Book ID is required for deletion.' });
      }

      await deleteBook(id);
      await logActivity('delete_book', 'books', id, { by: user.username });

      return res.status(200).json({ ok: true, message: `Book "${id}" deleted successfully.` });
    } catch (err) {
      console.error('[CMS Books] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete book.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${method} not allowed.` });
}
