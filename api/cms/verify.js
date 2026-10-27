import { requireAuth } from '../../lib/requireAuth.js';

/**
 * GET /api/cms/verify
 * Checks if the current JWT is still valid.
 * Used by the admin panel on load to avoid a stale session.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const payload = await requireAuth(req, res);
  if (!payload) return; // 401 already sent

  return res.status(200).json({ valid: true, user: payload.username });
}
