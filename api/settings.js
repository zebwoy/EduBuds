import { getAllSettings } from '../lib/db.js';

/**
 * Public API: GET /api/settings
 * Delivers public site configuration (WhatsApp contact, title, meta)
 * Cached at Edge / Cloudflare for fast, low-cost delivery.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Safe defaults if database is unconfigured or unreachable
  const defaults = {
    whatsapp_number: '919222315006',
    contact_email: 'support@edubuds.in',
    site_title: 'EduBuds — Learn. Grow. Shine.',
    site_description: 'EduBuds — a complete Islamic Studies curriculum for Grades 1–9. Three carefully crafted series: Islamic Studies, Prophet Stories, and the 20 Hadith Collection. Learn. Grow. Shine.',
    og_image: '/assets/logos/logo 3D.png',
  };

  try {
    const dbSettings = await getAllSettings();
    const settings = {
      whatsapp_number: dbSettings.whatsapp_number || defaults.whatsapp_number,
      contact_email: dbSettings.contact_email || defaults.contact_email,
      site_title: dbSettings.site_title || defaults.site_title,
      site_description: dbSettings.site_description || defaults.site_description,
      og_image: dbSettings.og_image || defaults.og_image,
      marquee_messages: dbSettings.marquee_messages ? JSON.parse(dbSettings.marquee_messages) : null,
    };

    // Cache for 5 minutes at Edge, serve stale up to 24 hours while revalidating
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(settings);
  } catch (err) {
    // If DB is offline or table hasn't been migrated yet, serve defaults gracefully
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(defaults);
  }
}
