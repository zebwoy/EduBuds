import { requireAuth } from '../../lib/requireAuth.js';
import { getAllSettings, setSetting, logActivity } from '../../lib/db.js';

/**
 * /api/cms/settings
 * GET: Retrieve all site settings
 * PUT / POST: Update one or more site settings
 * Protected — requires valid admin JWT.
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  if (req.method === 'GET') {
    try {
      const settings = await getAllSettings();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ settings });
    } catch (err) {
      console.error('[CMS Settings] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch settings from database.' });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const updates = body.settings || body;

      if (typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No settings provided to update.' });
      }

      // Allowed setting keys to prevent arbitrary DB pollution
      const ALLOWED_KEYS = [
        'whatsapp_number',
        'site_title',
        'site_description',
        'og_image',
        'contact_email',
        'marquee_messages',
        'announcement_banner'
      ];

      const savedKeys = [];

      for (const [key, rawVal] of Object.entries(updates)) {
        if (!ALLOWED_KEYS.includes(key)) continue;

        let val = rawVal;
        // Clean whatsapp_number (keep digits only)
        if (key === 'whatsapp_number' && typeof val === 'string') {
          val = val.replace(/\D/g, '');
        }

        await setSetting(key, String(val ?? ''));
        savedKeys.push(key);
      }

      await logActivity('update_settings', 'site_settings', savedKeys.join(','), {
        keys: savedKeys,
        updated_by: user.username,
      });

      const updated = await getAllSettings();
      return res.status(200).json({
        ok: true,
        message: 'Settings saved successfully.',
        settings: updated,
      });
    } catch (err) {
      console.error('[CMS Settings] Save error:', err);
      return res.status(500).json({ error: 'Failed to save settings.' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
