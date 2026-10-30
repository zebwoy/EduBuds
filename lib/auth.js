import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

/**
 * EduBuds Auth — Self-contained JWT + bcrypt
 * No external auth service. Credentials live in env variables.
 *
 * Required env vars:
 *   JWT_SECRET          — random 64-char string (openssl rand -base64 48)
 *   ADMIN_USERNAME      — your chosen admin username
 *   ADMIN_PASSWORD_HASH — bcrypt hash (run: npm run generate:hash)
 */

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('[EduBuds Auth] JWT_SECRET is not configured.');
  return new TextEncoder().encode(s);
}

/* ── JWT ──────────────────────────────────────────────────── */

export async function createToken(payload, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
}

/* ── Password ─────────────────────────────────────────────── */

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/* ── Bearer token extractor ───────────────────────────────── */

export function extractToken(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}
