import { requireAuth } from '../requireAuth.js';
import { getSubscribers, getAllSubscribersExport, deleteSubscriber, logActivity } from '../db.js';

/**
 * Helper to escape a field for RFC 4180 CSV output
 */
function escapeCsv(str) {
  if (str === null || str === undefined) return '""';
  const val = String(str);
  if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

/**
 * Protected CMS API: /api/cms/subscribers
 * GET: List subscribers with pagination/search OR export CSV (?format=csv)
 * DELETE: Remove a subscriber
 */
export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  if (req.method === 'GET') {
    try {
      // 1. CSV Export Mode
      if (req.query.format === 'csv') {
        const rows = await getAllSubscribersExport();
        const header = ['ID', 'Email', 'Source', 'Status', 'Subscribed At'];
        const csvLines = [header.join(',')];

        for (const row of rows) {
          const formattedDate = row.createdAt ? new Date(row.createdAt).toISOString() : '';
          csvLines.push([
            escapeCsv(row.id),
            escapeCsv(row.email),
            escapeCsv(row.source || 'website'),
            escapeCsv(row.status || 'active'),
            escapeCsv(formattedDate)
          ].join(','));
        }

        const csvContent = csvLines.join('\r\n');
        const filename = `edubuds-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(csvContent);
      }

      // 2. Paginated JSON View
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const search = req.query.search ? String(req.query.search).trim() : null;

      const result = await getSubscribers({ page, limit, search });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(result);
    } catch (err) {
      console.error('[CMS Subscribers] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch subscribers.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || (typeof req.body === 'object' ? req.body?.id : null);
      if (!id) {
        return res.status(400).json({ error: 'Subscriber ID is required for deletion.' });
      }

      await deleteSubscriber(parseInt(id, 10));
      await logActivity('delete_subscriber', 'subscribers', String(id), { by: user.username });

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('[CMS Subscribers] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete subscriber.' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
