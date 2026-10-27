import { getAllContent } from '../lib/db.js';

export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: 'MORE THAN BOOKS',
    heading: 'Islamic Studies.<br><em>Made complete.</em>',
    lead: 'Give Islamic learning the same thoughtful structure as any other school subject. EduBuds brings knowledge, practice, and character together — across three carefully crafted series, designed to grow with your child from Grade 1 all the way to Grade 9.',
    ctaPrimaryText: 'Explore the curriculum ↗',
    ctaPrimaryLink: '#curriculum',
    ctaSecondaryText: 'Browse the books →',
    ctaSecondaryLink: '#books',
    trustPills: ['GRADES 1–9', '3 SERIES', 'ONE JOURNEY']
  },
  stats: {
    stat1Num: '9', stat1Label: 'Grade levels',
    stat2Num: '3', stat2Label: 'Book series',
    stat3Num: '6', stat3Label: 'Learning strands',
    stat4Num: '1', stat4Label: 'Connected programme'
  },
  marquee: {
    items: [
      '✦ &nbsp; A complete Islamic Studies programme for growing minds',
      'Grades 1–9 &nbsp; • &nbsp; 3 Series &nbsp; • &nbsp; One connected journey',
      'Islamic Studies &nbsp; · &nbsp; Prophet Stories &nbsp; · &nbsp; 20 Hadith Collection',
      'Knowledge · Practice · Character'
    ]
  },
  curriculum: {
    eyebrow: 'THE EDUBUDS CURRICULUM',
    heading: 'A complete journey,<br><em>thoughtfully woven.</em>',
    lead: 'Across all nine grades, six essential strands of Islamic learning are carefully balanced throughout every module — creating variety, depth, and continuity in a single connected programme.',
    strands: [
      { num: '01', icon: '☼', name: 'Belief', desc: 'Build a meaningful foundation in what children believe and why it truly matters.', color: 'strand-blue' },
      { num: '02', icon: '❋', name: 'Action', desc: 'Connect knowledge to worship, choices, and everyday practice — seamlessly.', color: 'strand-green' },
      { num: '03', icon: '♡', name: "Du'as", desc: 'Supplications children can understand, remember, and reach for in daily life.', color: 'strand-yellow' },
      { num: '04', icon: '✿', name: 'Etiquettes', desc: 'Nurture manners, consideration, and beautiful everyday conduct from the inside out.', color: 'strand-pink' },
      { num: '05', icon: '▤', name: 'History & Biographies', desc: 'Discover people and events that carry enduring lessons and lasting inspiration.', color: 'strand-lilac' },
      { num: '06', icon: '❧', name: 'Tafseer', desc: "Introduce Qur'anic understanding as a natural, integrated part of the learning journey.", color: 'strand-aqua' }
    ]
  },
  approach: {
    eyebrow: 'OUR EDUCATIONAL PURPOSE',
    heading: 'Not just what they know.<br><em>Who they become.</em>',
    lead: 'We believe Islamic Studies should be more than isolated lessons. EduBuds is designed to bring beliefs, actions, supplications, manners, stories, and Qur\'anic understanding into a connected learning experience — one that shapes the whole child, not just their answers.',
    pillars: [
      { icon: '📖', title: 'Meaningful Knowledge', desc: 'Structured learning across nine grades — every concept building on the last.' },
      { icon: '🌱', title: 'Everyday Practice', desc: 'Six strands woven through every module, connecting belief to daily life.' },
      { icon: '✨', title: 'Lasting Character', desc: 'Learning that shapes who children are — not just what they can recall.' }
    ]
  },
  parents: {
    eyebrow: 'FOR PARENTS & EDUCATORS',
    heading: 'Make space for<br><em>meaningful learning.</em>',
    lead: 'You already think carefully about your child\'s education. EduBuds brings that same intentionality to Islamic Studies — a clear curriculum framework that supports teaching, conversation, and growth far beyond the page.',
    cards: [
      { num: '01', title: 'Clear progression', body: 'Understand the full journey from Grade 1 through Grade 9 — no guesswork.' },
      { num: '02', title: 'Balanced learning', body: 'Six strands woven through every grade — belief, action, du\'as, etiquettes, history, and Qur\'an.' },
      { num: '03', title: 'Learning that lasts', body: 'Books designed to connect understanding with practice — and practice with character.' },
      { num: '04', title: 'Beautiful by design', body: 'Carefully illustrated, clearly laid out — because how something looks shapes how it\'s received.' }
    ]
  }
};

/**
 * Public API: GET /api/content
 * Serves section copy for dynamic hydration.
 * Cached at Edge/Cloudflare for high speed and zero compute waste.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const dbContent = await getAllContent();
    const merged = { ...DEFAULT_CONTENT };

    for (const [key, val] of Object.entries(dbContent)) {
      if (val && typeof val === 'object') {
        merged[key] = { ...merged[key], ...val };
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ content: merged });
  } catch (err) {
    // If DB is offline or cold, serve defaults gracefully
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ content: DEFAULT_CONTENT });
  }
}
