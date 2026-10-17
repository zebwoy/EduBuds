import { insertSubscriber } from '../lib/db.js';

/**
 * Vercel Serverless Function: POST /api/subscribe
 * Handles newsletter subscriptions with honeypot spam protection
 * and saves to Supabase or Neon PostgreSQL.
 */
export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // 1. Honeypot check (hidden field to stop spam bots)
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      // Silently succeed for bots
      return res.status(200).json({ ok: true, message: 'Thanks for subscribing!' });
    }

    // 2. Email validation
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    if (!rawEmail || rawEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    // 3. Persist subscriber via DB adapter (Supabase or Neon)
    await insertSubscriber(rawEmail, body.source || 'website');

    return res.status(200).json({
      ok: true,
      message: "Thank you! You're on our list for future EduBuds updates.",
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      ok: false,
      error: "We couldn't save your subscription just now. Please try again shortly.",
    });
  }
}
