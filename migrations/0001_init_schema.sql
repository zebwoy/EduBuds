-- ====================================================================
-- EduBuds Initial Database Schema
-- Compatible with Supabase (PostgreSQL) and Neon PostgreSQL
-- ====================================================================

-- 1. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);

-- 2. Book Series (CMS)
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  color TEXT DEFAULT '#0878c9',
  color_light TEXT DEFAULT '#e7f2ff',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Books / Products (CMS)
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  whatsapp_message TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_series_id ON books (series_id);

-- 4. Customer Enquiries Log
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  message TEXT,
  customer_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Supabase Row Level Security (RLS) Policies
-- (Safe to run on Neon; RLS is standard PostgreSQL)
-- ====================================================================

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts to newsletter
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'Allow public newsletter signups'
  ) THEN
    CREATE POLICY "Allow public newsletter signups" ON newsletter_subscribers
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow public read of published series & books
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Allow public read series'
  ) THEN
    CREATE POLICY "Allow public read series" ON series
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'books' AND policyname = 'Allow public read books'
  ) THEN
    CREATE POLICY "Allow public read books" ON books
      FOR SELECT USING (is_published = true);
  END IF;
END $$;
