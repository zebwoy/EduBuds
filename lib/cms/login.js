import { comparePassword, createToken } from '../auth.js';

/**
 * POST /api/cms/login
 * Authenticates the admin and returns a signed JWT.
 *
 * Body: { username: string, password: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const { username, password } = body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const adminUser = process.env.ADMIN_USERNAME;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUser || !adminHash) {
    console.error('[EduBuds CMS] ADMIN_USERNAME or ADMIN_PASSWORD_HASH is not set.');
    return res.status(500).json({ error: 'Server is not configured for admin access.' });
  }

  // Always run bcrypt even on username mismatch to prevent timing attacks
  const [usernameMatch, passwordMatch] = await Promise.all([
    Promise.resolve(username === adminUser),
    comparePassword(password, adminHash),
  ]);

  if (!usernameMatch || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = await createToken({ username, role: 'admin' });

  return res.status(200).json({ token });
}
