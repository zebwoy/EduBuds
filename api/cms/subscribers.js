import { requireAuth } from '../../lib/requireAuth.js';
import { getSubscribers, getAllSubscribersExport, deleteSubscriber, logActivity } from '../../lib/db.js';

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
        const filename = `edubuds_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-store');

        await logActivity('export_subscribers_csv', 'newsletter_subscribers', null, {
          user: user.username,
          count: rows.length
        });

        return res.status(200).send(csvContent);
      }

      // 2. Paginated JSON Mode
      const { search, status, page, limit } = req.query;
      const result = await getSubscribers({
        search: search || '',
        status: status || 'all',
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50
      });

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(result);
    } catch (err) {
      console.error('[CMS Subscribers] GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch subscribers from database.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const id = req.query.id || body.id;

      if (!id) {
        return res.status(400).json({ error: 'Subscriber id is required for deletion.' });
      }

      await deleteSubscriber(id);
      await logActivity('delete_subscriber', 'newsletter_subscribers', String(id), {
        user: user.username
      });

      return res.status(200).json({ success: true, deletedId: id });
    } catch (err) {
      console.error('[CMS Subscribers] DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete subscriber.' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
