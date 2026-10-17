import { createClerkClient } from '@clerk/backend';

/**
 * EduBuds Auth Helper (Clerk)
 * Provides authentication and session verification for CMS and admin routes.
 */

let clerkClient = null;

export function getClerk() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

/**
 * Verify incoming request authentication via Clerk.
 * Can check Authorization header: Bearer <session_token>
 */
export async function verifyAuth(req) {
  const clerk = getClerk();
  if (!clerk) {
    return { authenticated: false, error: 'CLERK_SECRET_KEY not configured' };
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or malformed Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const verifiedSession = await clerk.verifyToken(token);
    return { authenticated: true, session: verifiedSession };
  } catch (err) {
    return { authenticated: false, error: err.message };
  }
}
