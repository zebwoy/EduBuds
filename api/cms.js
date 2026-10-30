import activityHandler from '../lib/cms/activity.js';
import booksHandler from '../lib/cms/books.js';
import contentHandler from '../lib/cms/content.js';
import dashboardHandler from '../lib/cms/dashboard.js';
import faqsHandler from '../lib/cms/faqs.js';
import loginHandler from '../lib/cms/login.js';
import mediaHandler from '../lib/cms/media.js';
import seriesHandler from '../lib/cms/series.js';
import settingsHandler from '../lib/cms/settings.js';
import subscribersHandler from '../lib/cms/subscribers.js';
import verifyHandler from '../lib/cms/verify.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const HANDLERS = {
  activity: activityHandler,
  books: booksHandler,
  content: contentHandler,
  dashboard: dashboardHandler,
  faqs: faqsHandler,
  login: loginHandler,
  media: mediaHandler,
  series: seriesHandler,
  settings: settingsHandler,
  subscribers: subscribersHandler,
  verify: verifyHandler,
};

/**
 * Unified EduBuds CMS API Gateway
 * Consolidates all protected CMS routes into a single Serverless Function,
 * keeping the deployment well under the Vercel Hobby plan limit of 12 functions.
 *
 * Routes requests to:
 * - /api/cms/login
 * - /api/cms/verify
 * - /api/cms/dashboard
 * - /api/cms/settings
 * - /api/cms/series
 * - /api/cms/books
 * - /api/cms/media
 * - /api/cms/faqs
 * - /api/cms/subscribers
 * - /api/cms/content
 * - /api/cms/activity
 */
export default async function handler(req, res) {
  // 1. Identify target route from query param (injected by Vercel rewrite: ?route=...)
  let route = req.query.route || req.query.path || req.query.slug;
  if (Array.isArray(route)) route = route.join('/');

  // 2. Fallback: Parse URL pathname directly if query param was not injected
  if (!route) {
    try {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const match = parsed.pathname.match(/^\/api\/cms\/?(.*)$/i);
      if (match && match[1]) {
        route = match[1];
      }
    } catch {
      // ignore
    }
  }

  // 3. Clean up route name (strip query string remnants and extra slashes)
  if (route) {
    route = route.split('?')[0].replace(/^\/+|\/+$/g, '').toLowerCase();
  }

  // 4. If base /api/cms is called with no route
  if (!route) {
    return res.status(200).json({
      service: 'EduBuds CMS API Gateway',
      status: 'operational',
      endpoints: Object.keys(HANDLERS).map(name => `/api/cms/${name}`)
    });
  }

  const targetHandler = HANDLERS[route];
  if (targetHandler) {
    return targetHandler(req, res);
  }

  return res.status(404).json({
    error: `CMS endpoint '/api/cms/${route}' not found.`,
    availableEndpoints: Object.keys(HANDLERS).map(name => `/api/cms/${name}`)
  });
}
