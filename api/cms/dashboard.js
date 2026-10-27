import { requireAuth } from '../../lib/requireAuth.js';
import { getDashboardStats } from '../../lib/db.js';

/**
 * GET /api/cms/dashboard
 * Returns aggregate stats for the admin dashboard.
 * Protected — requires valid JWT.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const payload = await requireAuth(req, res);
  if (!payload) return;

  try {
    const stats = await getDashboardStats();
    // No caching — always fresh for the admin
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(stats);
  } catch (err) {
    console.error('[CMS Dashboard] Stats error:', err);
    return res.status(500).json({ error: 'Could not load dashboard stats.' });
  }
}
