import { getAllFaqs } from '../lib/db.js';

export const DEFAULT_FAQS = [
  {
    id: 1,
    question: 'What grades and age groups does the EduBuds Islamic Studies curriculum cover?',
    answer: 'EduBuds offers a complete, sequentially structured Islamic Studies curriculum from Pre-Primer (PP1 and PP2) through Grade 8, covering children aged approximately 4 to 14. Across 10 core books, each level builds progressively on the last so students develop a strong, age-appropriate foundation in Islamic knowledge.',
    orderIndex: 1,
    isPublished: true
  },
  {
    id: 2,
    question: 'What subjects are covered in the EduBuds Islamic Studies textbooks?',
    answer: "Every grade in the EduBuds Islamic Studies syllabus weaves together six essential strands: belief (Aqeedah), worship and daily practice (Fiqh and Ibadah), everyday du'as, Islamic etiquettes and character (Akhlaq and Adab), prophetic history (Seerah), and Qur'an studies. This balanced approach connects classroom learning with everyday life.",
    orderIndex: 2,
    isPublished: true
  },
  {
    id: 3,
    question: 'Is EduBuds an English-medium Islamic Studies curriculum suitable for schools and madrasahs in India?',
    answer: 'Yes. Published by Maktabah As-Sunnah in India, EduBuds is an English-medium Islamic Studies programme designed specifically for modern Islamic schools, weekend madrasahs, and maktabs. Its clear layout, contemporary pedagogy, and illustrated pages make it easy for teachers to deliver structured lessons.',
    orderIndex: 3,
    isPublished: true
  },
  {
    id: 4,
    question: 'How can Islamic schools, madrasahs, or maktabs adopt EduBuds and place bulk orders?',
    answer: 'We provide institutional adoption packages for schools and madrasahs, including student textbooks, teacher lesson guides, and school-wide bulk order discounts. Administrators and educators can message us on WhatsApp at +91 92223 15006 or email support@edubuds.in to request sample inspection copies and curriculum guidance.',
    orderIndex: 4,
    isPublished: true
  },
  {
    id: 5,
    question: 'Can parents and homeschoolers in India use the EduBuds curriculum at home?',
    answer: 'Yes, absolutely. EduBuds is widely used by Muslim parents and homeschooling families across India who want a structured, reliable Islamic education for their children at home. Both individual grade books and complete boxed sets are available for direct home delivery.',
    orderIndex: 5,
    isPublished: true
  },
  {
    id: 6,
    question: "What Islamic children's book series are included in EduBuds?",
    answer: 'EduBuds currently publishes three dedicated series: the Islamic Studies Core Curriculum (10 books from Pre-Primer to Grade 8), the illustrated Prophet Stories Series for young learners, and the 20 Hadith Collection for Young Learners. Together, they support both structured syllabus study and joyful Islamic reading.',
    orderIndex: 6,
    isPublished: true
  },
  {
    id: 7,
    question: 'How is the EduBuds curriculum different from traditional Islamic Studies textbooks?',
    answer: 'Unlike fragmented or rote-only textbooks, EduBuds follows a connected, spiral curriculum framework where concepts deepen from Pre-Primer through Grade 8. Combined with thoughtful visual design, age-appropriate illustrations, and practical character-building activities, it helps children understand, retain, and practise what they learn.',
    orderIndex: 7,
    isPublished: true
  },
  {
    id: 8,
    question: 'How do I buy EduBuds Islamic books online in India?',
    answer: 'You can browse our catalogue on edubuds.in, choose the grade levels or series you need, and tap "Enquire on WhatsApp" to place your order directly with our team at +91 92223 15006, or email support@edubuds.in. Our advisors will confirm availability, pricing, and doorstep shipping.',
    orderIndex: 8,
    isPublished: true
  },
  {
    id: 9,
    question: 'Where are EduBuds books dispatched from and how long does delivery take across India?',
    answer: 'All orders are dispatched from our publishing house in Maharashtra, India, through reliable, tracked courier partners. Deliveries typically reach metro cities within 2–4 business days and other regions across India within 4–7 business days.',
    orderIndex: 9,
    isPublished: true
  }
];

/**
 * Public API: GET /api/faqs
 * Delivers published FAQs with Edge caching.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const faqs = await getAllFaqs(true);
    const result = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ faqs: result });
  } catch (err) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ faqs: DEFAULT_FAQS });
  }
}
