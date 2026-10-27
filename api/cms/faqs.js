import { requireAuth } from '../../lib/requireAuth.js';
import { getAllFaqs, getFaqById, upsertFaq, deleteFaq, toggleFaqPublish, logActivity } from '../../lib/db.js';

/**
 * Protected CMS API: /api/cms/faqs
 * GET: List all FAQs (including unpublished drafts)
 * POST: Create a new FAQ
 * PUT: Update an FAQ or toggle publish
 * DELETE: Delete an FAQ
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  if (req.method === 'GET') {
    try {
      const faqs = await getAllFaqs(false);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ faqs });
    } catch (err) {
      console.error('[CMS FAQs] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs from database.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { question, answer, orderIndex, isPublished } = body;

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question text is required.' });
      }
      if (!answer || !answer.trim()) {
        return res.status(400).json({ error: 'Answer text is required.' });
      }

      const created = await upsertFaq({
        question: question.trim(),
        answer: answer.trim(),
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : 0,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true
      });

      await logActivity('create_faq', 'faqs', String(created.id), {
        user: user.username,
        question: created.question
      });

      return res.status(201).json({ success: true, faq: created });
    } catch (err) {
      console.error('[CMS FAQs] POST error:', err);
      return res.status(500).json({ error: 'Failed to create FAQ.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { id, action, isPublished, question, answer, orderIndex } = body;

      if (!id) {
        return res.status(400).json({ error: 'FAQ id is required.' });
      }

      // Quick toggle publish
      if (action === 'toggle_publish') {
        const updated = await toggleFaqPublish(id, isPublished);
        await logActivity('toggle_faq_publish', 'faqs', String(id), {
          user: user.username,
          isPublished: Boolean(isPublished)
        });
        return res.status(200).json({ success: true, faq: updated });
      }

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question text is required.' });
      }
      if (!answer || !answer.trim()) {
        return res.status(400).json({ error: 'Answer text is required.' });
      }

      const updated = await upsertFaq({
        id,
        question: question.trim(),
        answer: answer.trim(),
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : 0,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true
      });

      await logActivity('update_faq', 'faqs', String(id), {
        user: user.username,
        question: updated.question
      });

      return res.status(200).json({ success: true, faq: updated });
    } catch (err) {
      console.error('[CMS FAQs] PUT error:', err);
      return res.status(500).json({ error: 'Failed to update FAQ.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const id = req.query.id || body.id;

      if (!id) {
        return res.status(400).json({ error: 'FAQ id is required for deletion.' });
      }

      await deleteFaq(id);
      await logActivity('delete_faq', 'faqs', String(id), {
        user: user.username
      });

      return res.status(200).json({ success: true, deletedId: id });
    } catch (err) {
      console.error('[CMS FAQs] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete FAQ.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
