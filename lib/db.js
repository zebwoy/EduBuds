import { neon } from '@neondatabase/serverless';

/**
 * EduBuds Database Adapter — Neon PostgreSQL
 * Single source of truth. No Supabase dependency.
 */

let _sql = null;

export function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      '[EduBuds DB] DATABASE_URL is not configured. ' +
      'Add it to your Vercel environment variables.'
    );
  }
  if (!_sql) _sql = neon(url);
  return _sql;
}

/* ── Newsletter ───────────────────────────────────────────── */

export async function insertSubscriber(email, source = 'website') {
  const sql = getSql();
  const normalized = email.trim().toLowerCase();
  const rows = await sql`
    INSERT INTO newsletter_subscribers (email, source)
    VALUES (${normalized}, ${source})
    ON CONFLICT (email) DO NOTHING
    RETURNING *
  `;
  return rows;
}

/* ── Site Settings ────────────────────────────────────────── */

export async function getAllSettings() {
  const sql = getSql();
  const rows = await sql`SELECT key, value FROM site_settings ORDER BY key`;
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function getSetting(key) {
  const sql = getSql();
  const rows = await sql`SELECT value FROM site_settings WHERE key = ${key}`;
  return rows[0]?.value ?? null;
}

export async function setSetting(key, value) {
  const sql = getSql();
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${String(value ?? '')}, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
  `;
}

/* ── Dashboard Stats ──────────────────────────────────────── */

export async function getDashboardStats() {
  const sql = getSql();
  const [booksRes, seriesRes, subsRes, faqsRes, actRes] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM books WHERE is_published = true`,
    sql`SELECT COUNT(*)::int AS count FROM series`,
    sql`SELECT COUNT(*)::int AS count FROM newsletter_subscribers WHERE status = 'active'`,
    sql`SELECT COUNT(*)::int AS count FROM faqs WHERE is_published = true`,
    sql`SELECT id, action, entity, entity_id AS "entityId", details, created_at AS "createdAt" FROM cms_activity ORDER BY created_at DESC LIMIT 8`
  ]);
  return {
    books:            booksRes[0]?.count  ?? 0,
    series:           seriesRes[0]?.count ?? 0,
    subscribers:      subsRes[0]?.count   ?? 0,
    faqs:             faqsRes[0]?.count   ?? 0,
    recentActivities: actRes              ?? []
  };
}

/* ── CMS Activity Log ─────────────────────────────────────── */

export async function logActivity(action, entity = null, entityId = null, details = null) {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO cms_activity (action, entity, entity_id, details)
      VALUES (${action}, ${entity}, ${entityId}, ${details ? JSON.stringify(details) : null})
    `;
  } catch {
    // Non-critical — don't throw
  }
}

/* ── Series CRUD ──────────────────────────────────────────── */

export async function getAllSeries() {
  const sql = getSql();
  return await sql`
    SELECT id, label, tagline, description, color, color_light AS "colorLight", order_index AS "orderIndex", created_at AS "createdAt"
    FROM series
    ORDER BY order_index ASC, id ASC
  `;
}

export async function getSeriesById(id) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, label, tagline, description, color, color_light AS "colorLight", order_index AS "orderIndex"
    FROM series
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function upsertSeries(s) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO series (id, label, tagline, description, color, color_light, order_index)
    VALUES (
      ${s.id},
      ${s.label},
      ${s.tagline || ''},
      ${s.description || ''},
      ${s.color || '#0878c9'},
      ${s.colorLight || s.color_light || '#e7f2ff'},
      ${parseInt(s.orderIndex ?? s.order_index ?? 0, 10)}
    )
    ON CONFLICT (id) DO UPDATE
      SET label = EXCLUDED.label,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          color_light = EXCLUDED.color_light,
          order_index = EXCLUDED.order_index
    RETURNING id, label, tagline, description, color, color_light AS "colorLight", order_index AS "orderIndex"
  `;
  return rows[0];
}

export async function deleteSeries(id) {
  const sql = getSql();
  await sql`DELETE FROM series WHERE id = ${id}`;
}

/* ── Books CRUD ───────────────────────────────────────────── */

export async function getAllBooks(seriesId = null) {
  const sql = getSql();
  if (seriesId) {
    return await sql`
      SELECT b.id, b.series_id AS "seriesId", s.label AS "seriesLabel", s.color AS "seriesColor",
             b.title, b.subtitle, b.image, b.tags, b.description,
             b.whatsapp_message AS "whatsappMessage", b.is_published AS "isPublished",
             b.order_index AS "orderIndex", b.created_at AS "createdAt", b.updated_at AS "updatedAt"
      FROM books b
      LEFT JOIN series s ON b.series_id = s.id
      WHERE b.series_id = ${seriesId}
      ORDER BY b.order_index ASC, b.id ASC
    `;
  }
  return await sql`
    SELECT b.id, b.series_id AS "seriesId", s.label AS "seriesLabel", s.color AS "seriesColor",
           b.title, b.subtitle, b.image, b.tags, b.description,
           b.whatsapp_message AS "whatsappMessage", b.is_published AS "isPublished",
           b.order_index AS "orderIndex", b.created_at AS "createdAt", b.updated_at AS "updatedAt"
    FROM books b
    LEFT JOIN series s ON b.series_id = s.id
    ORDER BY s.order_index ASC, b.order_index ASC, b.id ASC
  `;
}

export async function getBookById(id) {
  const sql = getSql();
  const rows = await sql`
    SELECT b.id, b.series_id AS "seriesId", s.label AS "seriesLabel",
           b.title, b.subtitle, b.image, b.tags, b.description,
           b.whatsapp_message AS "whatsappMessage", b.is_published AS "isPublished",
           b.order_index AS "orderIndex"
    FROM books b
    LEFT JOIN series s ON b.series_id = s.id
    WHERE b.id = ${id}
  `;
  return rows[0] ?? null;
}

export async function upsertBook(b) {
  const sql = getSql();
  const tagsArray = Array.isArray(b.tags)
    ? b.tags
    : typeof b.tags === 'string'
      ? b.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  const rows = await sql`
    INSERT INTO books (
      id, series_id, title, subtitle, image, tags,
      description, whatsapp_message, is_published, order_index, updated_at
    )
    VALUES (
      ${b.id},
      ${b.seriesId || b.series_id},
      ${b.title},
      ${b.subtitle || ''},
      ${b.image || ''},
      ${tagsArray},
      ${b.description || ''},
      ${b.whatsappMessage || b.whatsapp_message || ''},
      ${b.isPublished !== undefined ? Boolean(b.isPublished) : (b.is_published !== undefined ? Boolean(b.is_published) : true)},
      ${parseInt(b.orderIndex ?? b.order_index ?? 0, 10)},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET series_id = EXCLUDED.series_id,
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          image = EXCLUDED.image,
          tags = EXCLUDED.tags,
          description = EXCLUDED.description,
          whatsapp_message = EXCLUDED.whatsapp_message,
          is_published = EXCLUDED.is_published,
          order_index = EXCLUDED.order_index,
          updated_at = NOW()
    RETURNING id, series_id AS "seriesId", title, subtitle, image, tags,
              description, whatsapp_message AS "whatsappMessage",
              is_published AS "isPublished", order_index AS "orderIndex"
  `;
  return rows[0];
}

export async function deleteBook(id) {
  const sql = getSql();
  await sql`DELETE FROM books WHERE id = ${id}`;
}

export async function toggleBookPublish(id, isPublished) {
  const sql = getSql();
  const rows = await sql`
    UPDATE books
    SET is_published = ${Boolean(isPublished)},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, is_published AS "isPublished"
  `;
  return rows[0] ?? null;
}

/* ── Site Content CRUD (Section Copy) ─────────────────────── */

export async function getAllContent() {
  const sql = getSql();
  const rows = await sql`SELECT key, value, updated_at AS "updatedAt" FROM site_content ORDER BY key`;
  const result = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function getContentByKey(key) {
  const sql = getSql();
  const rows = await sql`SELECT value FROM site_content WHERE key = ${key}`;
  return rows[0]?.value ?? null;
}

export async function setContentByKey(key, value) {
  const sql = getSql();
  const jsonVal = typeof value === 'string' ? value : JSON.stringify(value);
  const rows = await sql`
    INSERT INTO site_content (key, value, updated_at)
    VALUES (${key}, ${jsonVal}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
    RETURNING key, value, updated_at AS "updatedAt"
  `;
  return rows[0];
}

/* ── FAQs CRUD ────────────────────────────────────────────── */

export async function getAllFaqs(onlyPublished = false) {
  const sql = getSql();
  if (onlyPublished) {
    return await sql`
      SELECT id, question, answer, order_index AS "orderIndex", is_published AS "isPublished", created_at AS "createdAt", updated_at AS "updatedAt"
      FROM faqs
      WHERE is_published = true
      ORDER BY order_index ASC, id ASC
    `;
  }
  return await sql`
    SELECT id, question, answer, order_index AS "orderIndex", is_published AS "isPublished", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM faqs
    ORDER BY order_index ASC, id ASC
  `;
}

export async function getFaqById(id) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, question, answer, order_index AS "orderIndex", is_published AS "isPublished"
    FROM faqs
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function upsertFaq(faq) {
  const sql = getSql();
  const orderIdx = parseInt(faq.orderIndex ?? faq.order_index ?? 0, 10);
  const isPub = faq.isPublished !== undefined ? Boolean(faq.isPublished) : (faq.is_published !== undefined ? Boolean(faq.is_published) : true);

  if (faq.id) {
    const rows = await sql`
      UPDATE faqs
      SET question = ${faq.question},
          answer = ${faq.answer},
          order_index = ${orderIdx},
          is_published = ${isPub},
          updated_at = NOW()
      WHERE id = ${faq.id}
      RETURNING id, question, answer, order_index AS "orderIndex", is_published AS "isPublished", updated_at AS "updatedAt"
    `;
    return rows[0];
  } else {
    const rows = await sql`
      INSERT INTO faqs (question, answer, order_index, is_published)
      VALUES (${faq.question}, ${faq.answer}, ${orderIdx}, ${isPub})
      RETURNING id, question, answer, order_index AS "orderIndex", is_published AS "isPublished", updated_at AS "updatedAt"
    `;
    return rows[0];
  }
}

export async function deleteFaq(id) {
  const sql = getSql();
  await sql`DELETE FROM faqs WHERE id = ${id}`;
}

export async function toggleFaqPublish(id, isPublished) {
  const sql = getSql();
  const rows = await sql`
    UPDATE faqs
    SET is_published = ${Boolean(isPublished)},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, is_published AS "isPublished"
  `;
  return rows[0] ?? null;
}

/* ── Subscribers Hub ──────────────────────────────────────── */

export async function getSubscribers({ search = '', status = 'all', page = 1, limit = 50 } = {}) {
  const sql = getSql();
  const lim = parseInt(limit, 10) || 50;
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const offset = (pg - 1) * lim;
  const searchPattern = search ? `%${search.trim().toLowerCase()}%` : null;

  let totalCount = 0;
  let rows = [];

  if (searchPattern && status !== 'all') {
    const countRes = await sql`
      SELECT COUNT(*)::int AS count
      FROM newsletter_subscribers
      WHERE email ILIKE ${searchPattern} AND status = ${status}
    `;
    totalCount = countRes[0]?.count ?? 0;
    rows = await sql`
      SELECT id, email, source, status, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM newsletter_subscribers
      WHERE email ILIKE ${searchPattern} AND status = ${status}
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;
  } else if (searchPattern) {
    const countRes = await sql`
      SELECT COUNT(*)::int AS count
      FROM newsletter_subscribers
      WHERE email ILIKE ${searchPattern}
    `;
    totalCount = countRes[0]?.count ?? 0;
    rows = await sql`
      SELECT id, email, source, status, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM newsletter_subscribers
      WHERE email ILIKE ${searchPattern}
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;
  } else if (status !== 'all') {
    const countRes = await sql`
      SELECT COUNT(*)::int AS count
      FROM newsletter_subscribers
      WHERE status = ${status}
    `;
    totalCount = countRes[0]?.count ?? 0;
    rows = await sql`
      SELECT id, email, source, status, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM newsletter_subscribers
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;
  } else {
    const countRes = await sql`
      SELECT COUNT(*)::int AS count FROM newsletter_subscribers
    `;
    totalCount = countRes[0]?.count ?? 0;
    rows = await sql`
      SELECT id, email, source, status, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM newsletter_subscribers
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;
  }

  return {
    subscribers: rows,
    total: totalCount,
    page: pg,
    limit: lim,
    totalPages: Math.ceil(totalCount / lim) || 1
  };
}

export async function getAllSubscribersExport() {
  const sql = getSql();
  return await sql`
    SELECT id, email, source, status, created_at AS "createdAt"
    FROM newsletter_subscribers
    ORDER BY created_at DESC
  `;
}

export async function deleteSubscriber(id) {
  const sql = getSql();
  await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
}

/* ── Activity Feed ────────────────────────────────────────── */

export async function getRecentActivities(limit = 20) {
  const sql = getSql();
  const lim = parseInt(limit, 10) || 20;
  return await sql`
    SELECT id, action, entity, entity_id AS "entityId", details, created_at AS "createdAt"
    FROM cms_activity
    ORDER BY created_at DESC
    LIMIT ${lim}
  `;
}
