import { verifyToken, extractToken } from './auth.js';

/**
 * requireAuth — middleware helper for CMS API routes.
 * Extracts + verifies the Bearer JWT from the request.
 * If invalid, sends a 401 and returns null.
 * If valid, returns the decoded payload.
 *
 * Usage:
 *   const payload = await requireAuth(req, res);
 *   if (!payload) return;  // response already sent
 */
export async function requireAuth(req, res) {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized — missing token.' });
    return null;
  }

  const { valid, payload } = await verifyToken(token);

  if (!valid) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return null;
  }

  return payload;
}
