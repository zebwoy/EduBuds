import { promises as fs } from 'fs';
import path from 'path';
import { getSupabase, getNeon } from '../lib/db.js';

/**
 * Vercel Serverless Function: GET /api/products
 * Returns the EduBuds series and catalog items.
 * Can serve from Supabase/Neon if tables exist, or falls back to public/products.json.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Check if Supabase has custom products configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: dbSeries, error } = await supabase
        .from('series')
        .select('*, books(*)');

      if (!error && dbSeries && dbSeries.length > 0) {
        return res.status(200).json({ series: dbSeries });
      }
    } catch {
      // Fall through to JSON
    }
  }

  // 2. Default: Read from public/products.json
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'products.json');
    const fileContent = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContent);

    // Cache header for 1 hour on Vercel Edge
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error reading products catalog:', err);
    return res.status(500).json({ error: 'Failed to load products catalog' });
  }
}
