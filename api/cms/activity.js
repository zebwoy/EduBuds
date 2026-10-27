import { requireAuth } from '../../lib/requireAuth.js';
import { getRecentActivities } from '../../lib/db.js';

/**
 * Protected CMS API: /api/cms/activity
 * GET: Retrieve latest audit log entries for the dashboard
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
    const activities = await getRecentActivities(limit);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ activities });
  } catch (err) {
    console.error('[CMS Activity] GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch activity log.' });
  }
}
