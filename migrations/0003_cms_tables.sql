-- ====================================================================
-- EduBuds CMS Tables — Migration 0003
-- Run after 0001_init_schema.sql and 0002_seed_products.sql
-- ====================================================================

-- 1. Site Settings — key/value store for global config
--    (WhatsApp number, site title, meta description, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Site Content — section-level editable content (stored as JSONB)
--    Each key maps to a full section's worth of copy fields.
CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id          BIGSERIAL PRIMARY KEY,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  order_index INTEGER     NOT NULL DEFAULT 0,
  is_published BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CMS Activity Log — lightweight audit trail
CREATE TABLE IF NOT EXISTS cms_activity (
  id         BIGSERIAL PRIMARY KEY,
  action     TEXT        NOT NULL,  -- e.g. 'updated_setting', 'created_book'
  entity     TEXT,                  -- e.g. 'site_settings', 'books'
  entity_id  TEXT,                  -- the key or row id that changed
  details    JSONB,                 -- optional payload snapshot
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Seed: Default Site Settings
-- ====================================================================
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number',  '919222315006'),
  ('contact_email',    'support@edubuds.in'),
  ('site_title',       'EduBuds — Learn. Grow. Shine.'),
  ('site_description', 'EduBuds — a complete Islamic Studies curriculum for Grades 1–9. Three carefully crafted series: Islamic Studies, Prophet Stories, and the 20 Hadith Collection. Learn. Grow. Shine.'),
  ('og_image',         '/assets/logos/logo 3D.png')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ====================================================================
-- Row Level Security
-- ====================================================================
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_activity   ENABLE ROW LEVEL SECURITY;

-- Public can read site_settings (whatsapp_number, etc.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'site_settings' AND policyname = 'Public read site_settings'
  ) THEN
    CREATE POLICY "Public read site_settings"
      ON site_settings FOR SELECT USING (true);
  END IF;
END $$;

-- Public can read published FAQs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'faqs' AND policyname = 'Public read faqs'
  ) THEN
    CREATE POLICY "Public read faqs"
      ON faqs FOR SELECT USING (is_published = true);
  END IF;
END $$;

-- Public can read site_content
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'site_content' AND policyname = 'Public read site_content'
  ) THEN
    CREATE POLICY "Public read site_content"
      ON site_content FOR SELECT USING (true);
  END IF;
END $$;

-- ====================================================================
-- Seed: Default Site Content (Section Copy)
-- ====================================================================
INSERT INTO site_content (key, value) VALUES
  ('hero', '{
    "eyebrow": "MORE THAN BOOKS",
    "heading": "Islamic Studies.<br><em>Made complete.</em>",
    "lead": "Give Islamic learning the same thoughtful structure as any other school subject. EduBuds brings knowledge, practice, and character together — across three carefully crafted series, designed to grow with your child from Grade 1 all the way to Grade 9.",
    "ctaPrimaryText": "Explore the curriculum ↗",
    "ctaPrimaryLink": "#curriculum",
    "ctaSecondaryText": "Browse the books →",
    "ctaSecondaryLink": "#books",
    "trustPills": ["GRADES 1–9", "3 SERIES", "ONE JOURNEY"]
  }'::jsonb),
  ('stats', '{
    "stat1Num": "9", "stat1Label": "Grade levels",
    "stat2Num": "3", "stat2Label": "Book series",
    "stat3Num": "6", "stat3Label": "Learning strands",
    "stat4Num": "1", "stat4Label": "Connected programme"
  }'::jsonb),
  ('marquee', '{
    "items": [
      "✦ &nbsp; A complete Islamic Studies programme for growing minds",
      "Grades 1–9 &nbsp; • &nbsp; 3 Series &nbsp; • &nbsp; One connected journey",
      "Islamic Studies &nbsp; · &nbsp; Prophet Stories &nbsp; · &nbsp; 20 Hadith Collection",
      "Knowledge · Practice · Character"
    ]
  }'::jsonb),
  ('curriculum', '{
    "eyebrow": "THE EDUBUDS CURRICULUM",
    "heading": "A complete journey,<br><em>thoughtfully woven.</em>",
    "lead": "Across all nine grades, six essential strands of Islamic learning are carefully balanced throughout every module — creating variety, depth, and continuity in a single connected programme.",
    "strands": [
      {"num": "01", "icon": "☼", "name": "Belief", "desc": "Build a meaningful foundation in what children believe and why it truly matters.", "color": "strand-blue"},
      {"num": "02", "icon": "❋", "name": "Action", "desc": "Connect knowledge to worship, choices, and everyday practice — seamlessly.", "color": "strand-green"},
      {"num": "03", "icon": "♡", "name": "Du''as", "desc": "Supplications children can understand, remember, and reach for in daily life.", "color": "strand-yellow"},
      {"num": "04", "icon": "✿", "name": "Etiquettes", "desc": "Nurture manners, consideration, and beautiful everyday conduct from the inside out.", "color": "strand-pink"},
      {"num": "05", "icon": "▤", "name": "History & Biographies", "desc": "Discover people and events that carry enduring lessons and lasting inspiration.", "color": "strand-lilac"},
      {"num": "06", "icon": "❧", "name": "Tafseer", "desc": "Introduce Qur''anic understanding as a natural, integrated part of the learning journey.", "color": "strand-aqua"}
    ]
  }'::jsonb),
  ('approach', '{
    "eyebrow": "OUR EDUCATIONAL PURPOSE",
    "heading": "Not just what they know.<br><em>Who they become.</em>",
    "lead": "We believe Islamic Studies should be more than isolated lessons. EduBuds is designed to bring beliefs, actions, supplications, manners, stories, and Qur''anic understanding into a connected learning experience — one that shapes the whole child, not just their answers.",
    "pillars": [
      {"icon": "📖", "title": "Meaningful Knowledge", "desc": "Structured learning across nine grades — every concept building on the last."},
      {"icon": "🌱", "title": "Everyday Practice", "desc": "Six strands woven through every module, connecting belief to daily life."},
      {"icon": "✨", "title": "Lasting Character", "desc": "Learning that shapes who children are — not just what they can recall."}
    ]
  }'::jsonb),
  ('parents', '{
    "eyebrow": "FOR PARENTS & EDUCATORS",
    "heading": "Make space for<br><em>meaningful learning.</em>",
    "lead": "You already think carefully about your child''s education. EduBuds brings that same intentionality to Islamic Studies — a clear curriculum framework that supports teaching, conversation, and growth far beyond the page.",
    "cards": [
      {"num": "01", "title": "Clear progression", "body": "Understand the full journey from Grade 1 through Grade 9 — no guesswork."},
      {"num": "02", "title": "Balanced learning", "body": "Six strands woven through every grade — belief, action, du''as, etiquettes, history, and Qur''an."},
      {"num": "03", "title": "Learning that lasts", "body": "Books designed to connect understanding with practice — and practice with character."},
      {"num": "04", "title": "Beautiful by design", "body": "Carefully illustrated, clearly laid out — because how something looks shapes how it''s received."}
    ]
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- Seed: Default FAQs
-- ====================================================================
INSERT INTO faqs (question, answer, order_index, is_published) VALUES
  ('What age or grade levels does the EduBuds curriculum cover?',
   'EduBuds is structured sequentially from Grade 1 through Grade 9 (covering children aged 6 to 15), progressively expanding their Islamic understanding as their cognitive abilities develop.',
   1, TRUE),
  ('How can schools or madrasahs adopt the EduBuds curriculum for classrooms?',
   'We offer comprehensive institutional adoption packages including teacher lesson guides, student textbooks, and school-wide bulk order discounts. Contact us directly on WhatsApp at +91 92223 15006 or email support@edubuds.in to request sample inspection copies.',
   2, TRUE),
  ('Are the books available for individual parents and homeschoolers?',
   'Yes, absolutely! Individual books and boxed sets are available for home delivery across India. You can select your desired books and tap "Enquire on WhatsApp" for direct ordering and fast doorstep shipping.',
   3, TRUE),
  ('What series are included in EduBuds?',
   'EduBuds currently comprises three core series: 1) The Islamic Studies Core Curriculum (Grades 1–9), 2) Prophet Stories (10 beautifully illustrated stories), and 3) The 20 Hadith Collection for Young Learners.',
   4, TRUE),
  ('Where are orders dispatched from and how long does delivery take?',
   'All orders are dispatched from our publishing house in India via tracked courier partners. Metro deliveries typically arrive within 2–4 business days, and other regions within 4–7 business days.',
   5, TRUE),
  ('How do I get in touch for bulk orders or custom inquiries?',
   'You can message our publishing team on WhatsApp at +91 92223 15006 (fastest response) or email support@edubuds.in. We are happy to assist parents, teachers, and school administrators.',
   6, TRUE)
ON CONFLICT DO NOTHING;

