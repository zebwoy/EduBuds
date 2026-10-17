# EduBuds — Learn. Grow. Shine.

A modern, fast, and brand-first online presence for **EduBuds** — a structured Islamic Studies curriculum for Grades 1–9, featuring three core book series:
1. **Islamic Studies Series** (Grades 1–9)
2. **Prophet Stories Series** (10 illustrated books in English, Roman Urdu, & Urdu box sets)
3. **20 Hadith Collection** (Posters & lesson set)

---

## 🛠 Tech Stack & Architecture

- **Hosting & Deployment:** [Vercel](https://vercel.com) (Edge CDN, Serverless Functions)
- **Database:** [Supabase](https://supabase.com) or [Neon PostgreSQL](https://neon.tech)
- **Authentication:** [Clerk](https://clerk.com)
- **File / Asset Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Frontend:** Modern Semantic HTML5, Vanilla CSS3 (custom design system, responsive typography, micro-animations, 3D visual effects, dark/light theme toggle), and Vanilla JS.
- **Conversion Flow:** Instant WhatsApp order inquiry routing with custom pre-filled order messages per book title.

---

## 📂 Project Structure

```text
EduBuds/
├── api/
│   ├── subscribe.js        # Vercel Serverless Function: Newsletter sign-ups
│   ├── newsletter.js       # Backward-compatibility alias
│   └── products.js         # API endpoint returning product series catalog
├── lib/
│   ├── db.js               # Database client (supports Supabase & Neon PostgreSQL)
│   ├── auth.js             # Clerk session and token validation utility
│   └── blob.js             # Vercel Blob file management utility
├── migrations/
│   ├── 0001_init_schema.sql    # PostgreSQL schema (subscribers, series, books, enquiries)
│   └── 0002_seed_products.sql  # Initial catalog seed data
├── public/
│   ├── assets/             # Brand logos, 3D book covers, illustrations
│   ├── index.html          # Main brand experience & interactive catalog
│   ├── privacy.html        # Privacy policy page
│   ├── products.json       # Source of truth catalog data for offline/standalone use
│   ├── script.js           # Interactive UI, 3D tilt, counters, dynamic filter tabs
│   └── theme.css           # Premium design system tokens, themes, animations
├── .env.example            # Environment variables template
├── package.json            # Node.js dependencies & scripts
└── vercel.json             # Vercel deployment configuration
```

---

## 🚀 Quick Start & Deployment

### 1. Local Development
```bash
# Install dependencies
npm install

# Run locally with Vercel CLI (or serve public/ directly)
npx vercel dev
```

### 2. Database Setup (Supabase or Neon)
1. In your **Supabase** SQL Editor or **Neon** Console, run the SQL script in:
   - `migrations/0001_init_schema.sql`
   - `migrations/0002_seed_products.sql`
2. Copy your connection keys into your environment variables.

### 3. Deploying to Vercel
1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Project Settings > Environment Variables**, add the variables listed in `.env.example`:
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (or `DATABASE_URL` for Neon)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (your WhatsApp ordering number, digits only)
   - `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (when enabling admin login)
4. Hit **Deploy**. Vercel will build and serve the site with global CDN edge caching!

---

## 💬 WhatsApp Order Flow
EduBuds uses direct WhatsApp lead generation. When a customer clicks **"Order via WhatsApp ↗"** on any book card or modal, it automatically opens WhatsApp with a pre-filled, customized message specifying the exact title, grade level, and language edition.
