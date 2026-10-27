# EduBuds — Learn. Grow. Shine.

A modern, fast, brand-first online presence and comprehensive Content Management System (CMS Studio) for **EduBuds** (Maktabah As-Sunnah) — a structured Islamic Studies curriculum for Grades 1–9, featuring three core book series:
1. **Islamic Studies Series** (Grades 1–9)
2. **Prophet Stories Series** (10 illustrated books in English, Roman Urdu, & Urdu box sets)
3. **20 Hadith Collection** (Posters & lesson set)

---

## 🛠 Tech Stack & Zero-Cost Architecture

- **Hosting & Deployment:** [Vercel](https://vercel.com) (Edge CDN, Serverless Functions)
- **Domain & DNS:** Hostinger custom domain + [Cloudflare](https://cloudflare.com) Edge DNS / SSL / CDN Caching
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech) (Generous free tier, connection pooling, auto-scaling)
- **Authentication:** Self-contained stateless JWT (`jose`) + `bcryptjs` (Zero ongoing SaaS auth subscriptions)
- **CMS Studio:** Built-in production studio at `/admin` with dark luxury theme
- **Asset Storage:** Local repository assets (35+ covers and brand graphics) + optional [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) cloud uploads
- **Frontend:** Semantic HTML5, Vanilla CSS3 (custom design system tokens, responsive typography, micro-animations, dark/light theme toggle), and Vanilla JS
- **Conversion Flow:** Instant WhatsApp order enquiry routing with custom pre-filled messages per book title

---

## 📞 Official Contact Configuration

- **Support Email:** `support@edubuds.in`
- **WhatsApp / Mobile Channel:** `+91 92223 15006` (WhatsApp API string: `919222315006`)

---

## 📂 Project Structure

```text
EduBuds/
├── api/
│   ├── cms/
│   │   ├── login.js            # POST: Authenticate admin & issue signed JWT (7 days)
│   │   ├── verify.js           # GET: Verify active admin JWT
│   │   ├── dashboard.js        # GET: Aggregate catalogue, subscriber, and FAQ stats
│   │   ├── settings.js         # GET/PUT: Read and update site settings in Neon DB
│   │   ├── series.js           # GET/POST/PUT/DELETE: Book series curriculum CRUD
│   │   ├── books.js            # GET/POST/PUT/DELETE: Books CRUD & toggle publish
│   │   ├── media.js            # GET/POST/DELETE: Media Library (local assets + Vercel Blob)
│   │   ├── content.js          # GET/PUT: Section Copy Editor (Hero, Marquee, Stats, Curriculum, etc.)
│   │   ├── faqs.js             # GET/POST/PUT/DELETE: FAQ Manager CRUD & toggle publish
│   │   ├── subscribers.js      # GET/DELETE: Paginated subscribers list & RFC 4180 CSV export
│   │   └── activity.js         # GET: Recent audit log feed
│   ├── settings.js             # Public GET: Edge-cached site settings with static fallback
│   ├── content.js              # Public GET: Edge-cached section copy with static fallback
│   ├── faqs.js                 # Public GET: Edge-cached published FAQs with static fallback
│   ├── products.js             # Public GET: Product series catalogue (Neon DB + JSON fallback)
│   ├── subscribe.js            # Public POST: Newsletter sign-ups with honeypot spam protection
│   └── newsletter.js           # Backward-compatibility alias for subscribe
├── lib/
│   ├── db.js                   # Neon PostgreSQL adapter (settings, series, books, content, faqs, subscribers, audit)
│   ├── auth.js                 # JWT creation, verification, and bcrypt password comparison
│   ├── requireAuth.js          # API middleware helper to protect CMS routes
│   └── blob.js                 # Vercel Blob file management utility
├── migrations/
│   ├── 0001_init_schema.sql    # Core tables: series, books, subscribers, enquiries
│   ├── 0002_seed_products.sql  # Initial catalogue seed data
│   └── 0003_cms_tables.sql     # CMS tables: site_settings, site_content, faqs, cms_activity
├── public/
│   ├── admin/                  # EduBuds CMS Studio (/admin)
│   │   ├── index.html          # Admin dashboard, views, modals, and login shell
│   │   ├── admin.css           # Modern dark luxury studio design system
│   │   └── admin.js            # Client-side reactivity, auth, stats, CRUD controllers
│   ├── assets/                 # Brand logos, 3D book covers, illustrations
│   ├── index.html              # Main brand experience, interactive catalogue, FAQ accordion
│   ├── privacy.html            # Privacy policy page
│   ├── products.json           # Catalogue fallback data for offline/standalone resilience
│   ├── script.js               # Interactive UI, 3D tilt, counters, dynamic settings & content loaders
│   └── theme.css               # Premium design system tokens, themes, animations
├── scripts/
│   └── generate-hash.js        # CLI utility to generate bcrypt password hashes & JWT secrets
├── .env.example                # Environment variables template
├── package.json                # Node.js dependencies & scripts
└── vercel.json                 # Vercel deployment configuration & admin rewrites
```

---

## 🖥 CMS Studio Features (`/admin`)

1. **Dashboard & Real-Time Stats:**
   - Active counters for Published Books, Series, Subscribers, and FAQs.
   - Quick WhatsApp routing test and live public site preview links.
   - Live Audit Trail feed tracking every admin action (who, what, when).

2. **Global Settings Manager:**
   - Modify the WhatsApp order receiving phone number on the fly.
   - Update official contact email (`support@edubuds.in`), SEO meta title, description, and social share OG image.

3. **Books & Series Catalogue Manager:**
   - Filter by series pills or search title, subtitle, and tags.
   - Instant 1-click Live / Draft toggle switches.
   - Add/edit book details, grade levels, and customized WhatsApp order message templates.
   - Create and configure curriculum series with custom brand colors and taglines.

4. **Media Library:**
   - Scans 35+ high-resolution covers and logos included in the repository.
   - 1-click clipboard URL copying for book assignments.
   - Direct upload to Vercel Blob cloud storage with drag-and-drop.
   - Visual Media Picker modal integrated directly into the Book Editor.

5. **Section Copy Editor:**
   - Live editing for Hero headline, sub-headline, and CTAs.
   - Topline announcement marquee items.
   - Stats counters and labels.
   - Curriculum overview, Educational purpose pillars, and For Parents copy.

6. **FAQ Manager:**
   - Add and update questions and answers for parents and schools.
   - Reorder questions and toggle visibility without writing code.
   - Automatic Edge-cached synchronization with public accordion on `index.html`.

7. **Subscribers Hub:**
   - View newsletter acquisitions with search and status filtering.
   - Export mailing list directly to an RFC 4180 compliant CSV file (`.csv`) for campaign use.

---

## 🚀 Deployment Guide (Hostinger + Cloudflare + Vercel + Neon)

### 1. Database Setup (Neon PostgreSQL)
1. Create a free PostgreSQL database on [Neon Console](https://console.neon.tech).
2. In the **Neon SQL Editor**, run the migration files in order:
   - [migrations/0001_init_schema.sql](file:///d:/Work/Maktabah%20As-Sunnah/EduBuds/Website/EduBuds/migrations/0001_init_schema.sql)
   - [migrations/0002_seed_products.sql](file:///d:/Work/Maktabah%20As-Sunnah/EduBuds/Website/EduBuds/migrations/0002_seed_products.sql)
   - [migrations/0003_cms_tables.sql](file:///d:/Work/Maktabah%20As-Sunnah/EduBuds/Website/EduBuds/migrations/0003_cms_tables.sql)
3. Copy your connection string (`DATABASE_URL`).

### 2. Generate Admin Password Hash
Run the credential generator script to create your password hash and JWT secret:
```bash
node scripts/generate-hash.js your_strong_admin_password
```
Copy `ADMIN_PASSWORD_HASH` and `JWT_SECRET`.

### 3. Deploying to Vercel
1. Import the repository in [Vercel](https://vercel.com/new).
2. In **Project Settings > Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `ADMIN_USERNAME`: Your chosen admin username (e.g. `edubuds_admin`)
   - `ADMIN_PASSWORD_HASH`: The bcrypt hash generated in Step 2
   - `JWT_SECRET`: The 64-character secret generated in Step 2
   - `BLOB_READ_WRITE_TOKEN`: (Optional) From Vercel Storage tab if uploading new files to cloud
3. Deploy!

### 4. Custom Domain (Hostinger + Cloudflare)
1. Buy domain on Hostinger (`edubuds.in`).
2. In Cloudflare, add site and update Hostinger nameservers to Cloudflare.
3. In Cloudflare DNS settings, add CNAME pointing `@` and `www` to `cname.vercel-dns.com` (proxied or DNS-only).
4. In Cloudflare Caching Rules, edge caching will automatically respect `s-maxage=300` headers set on `/api/settings`, `/api/products`, `/api/content`, and `/api/faqs`.

---

## 💬 WhatsApp Order Flow
EduBuds uses direct WhatsApp lead generation. When a customer taps **"Enquire on WhatsApp"** on any book card or modal, it automatically opens WhatsApp with a pre-filled, customized message specifying the exact title, grade level, and language edition. The WhatsApp number is dynamically controlled from the CMS Studio without requiring code redeployments.

