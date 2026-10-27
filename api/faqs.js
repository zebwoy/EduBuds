import { getAllFaqs } from '../lib/db.js';

export const DEFAULT_FAQS = [
  {
    id: 1,
    question: 'What age or grade levels does the EduBuds curriculum cover?',
    answer: 'EduBuds is structured sequentially from Grade 1 through Grade 9 (covering children aged 6 to 15), progressively expanding their Islamic understanding as their cognitive abilities develop.',
    orderIndex: 1,
    isPublished: true
  },
  {
    id: 2,
    question: 'How can schools or madrasahs adopt the EduBuds curriculum for classrooms?',
    answer: 'We offer comprehensive institutional adoption packages including teacher lesson guides, student textbooks, and school-wide bulk order discounts. Contact us directly on WhatsApp at +91 92223 15006 or email support@edubuds.in to request sample inspection copies.',
    orderIndex: 2,
    isPublished: true
  },
  {
    id: 3,
    question: 'Are the books available for individual parents and homeschoolers?',
    answer: 'Yes, absolutely! Individual books and boxed sets are available for home delivery across India. You can select your desired books and tap "Enquire on WhatsApp" for direct ordering and fast doorstep shipping.',
    orderIndex: 3,
    isPublished: true
  },
  {
    id: 4,
    question: 'What series are included in EduBuds?',
    answer: 'EduBuds currently comprises three core series: 1) The Islamic Studies Core Curriculum (Grades 1–9), 2) Prophet Stories (10 beautifully illustrated stories), and 3) The 20 Hadith Collection for Young Learners.',
    orderIndex: 4,
    isPublished: true
  },
  {
    id: 5,
    question: 'Where are orders dispatched from and how long does delivery take?',
    answer: 'All orders are dispatched from our publishing house in India via tracked courier partners. Metro deliveries typically arrive within 2–4 business days, and other regions within 4–7 business days.',
    orderIndex: 5,
    isPublished: true
  },
  {
    id: 6,
    question: 'How do I get in touch for bulk orders or custom inquiries?',
    answer: 'You can message our publishing team on WhatsApp at +91 92223 15006 (fastest response) or email support@edubuds.in. We are happy to assist parents, teachers, and school administrators.',
    orderIndex: 6,
    isPublished: true
  }
];

/**
 * Public API: GET /api/faqs
 * Delivers published FAQs with Edge caching.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const faqs = await getAllFaqs(true);
    const result = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ faqs: result });
  } catch (err) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ faqs: DEFAULT_FAQS });
  }
}
