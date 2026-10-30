import { requireAuth } from '../requireAuth.js';
import { getAllContent, getContentByKey, setContentByKey, logActivity } from '../db.js';
import { DEFAULT_CONTENT } from '../../api/content.js';

/**
 * Protected CMS API: /api/cms/content
 * GET: Retrieve all sections for CMS editing
 * PUT / POST: Update a specific section or multiple sections
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  if (req.method === 'GET') {
    try {
      const dbContent = await getAllContent();
      const merged = { ...DEFAULT_CONTENT };

      for (const [key, val] of Object.entries(dbContent)) {
        if (val && typeof val === 'object') {
          merged[key] = { ...merged[key], ...val };
        }
      }

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ content: merged });
    } catch (err) {
      console.error('[CMS Content] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch content from database.' });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const { section, data } = body;

      const ALLOWED_SECTIONS = ['hero', 'stats', 'marquee', 'curriculum', 'approach', 'parents'];

      // Single section update: { section: 'hero', data: {...} }
      if (section && data) {
        if (!ALLOWED_SECTIONS.includes(section)) {
          return res.status(400).json({ error: `Invalid section name: ${section}` });
        }
        await setContentByKey(section, data);
        await logActivity('update_section', 'site_content', section, {
          user: user.username,
          updatedFields: Object.keys(data)
        });
        return res.status(200).json({ success: true, section, data });
      }

      // Batch update: { sections: { hero: {...}, stats: {...} } }
      const sections = body.sections || body;
      if (typeof sections === 'object' && !Array.isArray(sections)) {
        const updated = [];
        for (const [secKey, secVal] of Object.entries(sections)) {
          if (!ALLOWED_SECTIONS.includes(secKey)) continue;
          await setContentByKey(secKey, secVal);
          updated.push(secKey);
        }
        await logActivity('batch_update_sections', 'site_content', updated.join(','), {
          user: user.username,
          sections: updated
        });
        return res.status(200).json({ success: true, updated });
      }

      return res.status(400).json({ error: 'Provide section and data in request body.' });
    } catch (err) {
      console.error('[CMS Content] PUT error:', err);
      return res.status(500).json({ error: 'Failed to save section content.' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
