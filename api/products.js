import { promises as fs } from 'fs';
import path from 'path';
import { getSql } from '../lib/db.js';

/**
 * Vercel Serverless Function: GET /api/products
 * Returns the EduBuds series and catalog items.
 * Can serve from Neon PostgreSQL if configured and populated,
 * or gracefully falls back to public/products.json.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Try querying Neon database
  try {
    const sql = getSql();
    const seriesRows = await sql`
      SELECT id, label, tagline, description, color, color_light as "colorLight", order_index
      FROM series
      ORDER BY order_index ASC, id ASC
    `;

    if (seriesRows && seriesRows.length > 0) {
      const booksRows = await sql`
        SELECT id, series_id, title, subtitle, image, tags, description,
               whatsapp_message as "whatsappMessage", is_published, order_index
        FROM books
        WHERE COALESCE(is_published, true) = true
        ORDER BY order_index ASC, id ASC
      `;

      // Group books by series
      const seriesMap = seriesRows.map(s => ({
        ...s,
        books: booksRows
          .filter(b => b.series_id === s.id)
          .map(({ series_id, ...book }) => book)
      }));

      // Rapid edge revalidation (30s edge, 60s stale) so CMS edits sync almost immediately
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
      return res.status(200).json({ series: seriesMap });
    }
  } catch (dbErr) {
    // If DB is offline, tables don't exist yet, or DATABASE_URL not set,
    // seamlessly fall through to local products.json
  }

  // 2. Fallback: Read from public/products.json
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'products.json');
    const fileContent = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContent);

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Products API] Error reading products fallback:', err);
    return res.status(500).json({ error: 'Failed to load products catalog' });
  }
}
