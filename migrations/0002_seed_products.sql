-- ====================================================================
-- EduBuds Initial Catalog Seed Data
-- ====================================================================

-- 1. Insert Series
INSERT INTO series (id, label, tagline, description, color, color_light, order_index)
VALUES 
  (
    'islamic-studies',
    'Islamic Studies Series',
    'A complete curriculum — Grades 1 to 9',
    'A carefully structured Islamic Studies programme that grows with the learner. Each grade contains four modules, weaving belief, action, du''as, etiquettes, history, and Qur''anic understanding into one connected journey.',
    '#0878c9',
    '#e7f2ff',
    1
  ),
  (
    'prophet-stories',
    'Prophet Stories Series',
    '10 illustrated storybooks — Prophets Sent by Allah',
    'A set of ten beautifully illustrated storybooks, each bringing to life the story of a Prophet sent by Allah. Written with clarity and care, these books make prophetic history accessible and memorable for young readers.',
    '#279447',
    '#e5f5e5',
    2
  ),
  (
    'hadith-collection',
    '20 Hadith Collection',
    '20 essential ahadith for growing Muslims',
    'Twenty carefully selected ahadith presented in a child-friendly format — with Arabic text, transliteration, translation, vocabulary, explanation, and an activity. Designed to be understood, remembered, and lived.',
    '#ffc20e',
    '#fff3c9',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Books
INSERT INTO books (id, series_id, title, subtitle, image, tags, description, whatsapp_message, order_index)
VALUES
  (
    'is-grade-1', 'islamic-studies', 'Islamic Studies', 'Grade 1',
    '/assets/Resource/39 Grade 1.png', ARRAY['Grade 1', 'Curriculum'],
    'The foundation year — introducing children to belief, practice, and the beauty of being Muslim through age-appropriate stories and activities.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 1 book. Could you please share details on pricing, availability, and how to place an order?',
    1
  ),
  (
    'is-grade-2', 'islamic-studies', 'Islamic Studies', 'Grade 2',
    '/assets/Resource/39 Grade 2.png', ARRAY['Grade 2', 'Curriculum'],
    'Building on Year 1, Grade 2 deepens understanding of worship, manners, and selected du''as with engaging lessons suited to the growing learner.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 2 book. Could you please share details on pricing, availability, and how to place an order?',
    2
  ),
  (
    'is-grade-3', 'islamic-studies', 'Islamic Studies', 'Grade 3',
    '/assets/Resource/39 Grade 3.png', ARRAY['Grade 3', 'Curriculum'],
    'Grade 3 introduces richer Qur''anic understanding, prophetic biographies, and a stronger lens on character and Islamic etiquettes.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 3 book. Could you please share details on pricing, availability, and how to place an order?',
    3
  ),
  (
    'is-grade-4', 'islamic-studies', 'Islamic Studies', 'Grade 4',
    '/assets/Resource/39 Grade 4.png', ARRAY['Grade 4', 'Curriculum'],
    'Grade 4 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur''an, preparing them for the middle years.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 4 book. Could you please share details on pricing, availability, and how to place an order?',
    4
  ),
  (
    'is-grades-5-9', 'islamic-studies', 'Islamic Studies', 'Grades 5–9',
    '/assets/Resource/Grade 1 Cover.jpg', ARRAY['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Curriculum'],
    'The complete upper curriculum — Grades 5 through 9 continue to build a well-rounded Islamic identity, preparing young Muslims for adulthood with knowledge, practice, and character.',
    'Assalamu Alaikum! I am interested in enquiring about the EduBuds Islamic Studies books for Grades 5 to 9. Could you please share details on availability and how to place an order?',
    5
  ),
  (
    'ps-box-english', 'prophet-stories', 'Prophets Sent by Allah', 'Complete Box Set — English',
    '/assets/Resource/29 Prophet series box - English1.png', ARRAY['Box Set', 'English', 'Stories'],
    'The complete collection — all 10 Prophet storybooks in a beautiful box set. Perfect as a gift or for the home library. Available in English.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (English). Could you please share details on pricing, availability, and delivery?',
    6
  ),
  (
    'ps-box-roman', 'prophet-stories', 'Prophets Sent by Allah', 'Complete Box Set — Roman Urdu',
    '/assets/Resource/29 Prophet series box - Roman1.png', ARRAY['Box Set', 'Roman Urdu', 'Stories'],
    'The complete collection in Roman Urdu — all 10 Prophet storybooks in a beautiful box set. Accessible to Urdu-speaking families who read in Roman script.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Roman Urdu). Could you please share details on pricing, availability, and delivery?',
    7
  ),
  (
    'ps-box-urdu', 'prophet-stories', 'Prophets Sent by Allah', 'Complete Box Set — Urdu',
    '/assets/Resource/29 Prophet series box - Urdu.png', ARRAY['Box Set', 'Urdu', 'Stories'],
    'The complete collection in Urdu — all 10 Prophet storybooks in a beautiful box set for Urdu-speaking families.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Urdu). Could you please share details on pricing, availability, and delivery?',
    8
  ),
  (
    'ps-adam', 'prophet-stories', 'The Story of Adam', 'عليه السلام',
    '/assets/Resource/29 Adam (AS)-02.png', ARRAY['Individual Title', 'Stories'],
    'The story of the first human being and first Prophet — Adam (AS). A gentle and meaningful introduction to creation, trust, and returning to Allah.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds storybook ''The Story of Adam (AS)''. Could you please share details on pricing and availability?',
    9
  ),
  (
    'ps-nooh', 'prophet-stories', 'The Story of Nooh', 'عليه السلام',
    '/assets/Resource/29 Nooh (AS)-02.png', ARRAY['Individual Title', 'Stories'],
    'The extraordinary story of Prophet Nooh (AS) — patience, conviction, and trust in Allah against all odds. A timeless lesson for every generation.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds storybook ''The Story of Nooh (AS)''. Could you please share details on pricing and availability?',
    10
  ),
  (
    'hc-poster-set', 'hadith-collection', '20 Hadith for Kids', 'Full Poster & Lesson Set',
    '/assets/Resource/20 hadith.png', ARRAY['Hadith', 'Collection', 'Posters'],
    'Twenty essential ahadith presented as beautiful, classroom-ready posters with Arabic, transliteration, translation, explanation, and activities built in. Ideal for homes, madrasahs, and Islamic schools.',
    'Assalamu Alaikum! I am interested in ordering the EduBuds ''20 Hadith for Kids'' collection. Could you please share details on pricing, format options, and availability?',
    11
  )
ON CONFLICT (id) DO NOTHING;
