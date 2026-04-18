// IT-1 Section — Batch 2022–26
// All 73 students — no dummy data, all real names & roll numbers

export const SUPERLATIVE_OPTIONS = [
  'Most Likely to Build a Startup',
  'Most Likely to Go Abroad',
  'The Debugger',
  'The Night Owl',
  'Most Creative',
  'The Peacemaker',
  'Future CEO',
  'Most Likely to Win a Hackathon',
  'The Helper',
  'Most Likely to Work at Google',
  'The Meme Lord',
  'Most Determined',
  'The Mentor',
  'Most Likely to Write a Book',
  'The Innovator',
  'Most Likely to Become a Professor',
  'The Problem Solver',
  'Most Likely to Invent Something',
  'The Team Player',
  'Most Likely to Travel the World',
  'The Organizer',
  'Most Likely to Make a Viral App',
  'The Visionary',
  'Most Likely to Succeed',
];

export const ACCENT_COLORS = [
  { id: 'violet',   label: 'Violet',   primary: '#7c3aed', light: '#ede9fe' },
  { id: 'rose',     label: 'Rose',     primary: '#e11d48', light: '#ffe4e6' },
  { id: 'amber',    label: 'Amber',    primary: '#d97706', light: '#fef3c7' },
  { id: 'teal',     label: 'Teal',     primary: '#0d9488', light: '#ccfbf1' },
  { id: 'indigo',   label: 'Indigo',   primary: '#4338ca', light: '#e0e7ff' },
  { id: 'fuchsia',  label: 'Fuchsia',  primary: '#a21caf', light: '#fae8ff' },
  { id: 'emerald',  label: 'Emerald',  primary: '#059669', light: '#d1fae5' },
  { id: 'sky',      label: 'Sky',      primary: '#0284c7', light: '#e0f2fe' },
];

export const GRADIENT_POOL = [
  'linear-gradient(135deg,#7c3aed,#4338ca)',
  'linear-gradient(135deg,#e11d48,#f97316)',
  'linear-gradient(135deg,#0d9488,#0284c7)',
  'linear-gradient(135deg,#a21caf,#7c3aed)',
  'linear-gradient(135deg,#d97706,#dc2626)',
  'linear-gradient(135deg,#059669,#0d9488)',
  'linear-gradient(135deg,#0284c7,#4338ca)',
  'linear-gradient(135deg,#be185d,#e11d48)',
  'linear-gradient(135deg,#854d0e,#d97706)',
  'linear-gradient(135deg,#166534,#059669)',
];

// Build initial student list — all profiles start EMPTY (no dummy data)
const RAW = [
  ['1601-22-737-001', 'A S Kruthi'],
  ['1601-22-737-002', 'Aashi Manker'],
  ['1601-22-737-003', 'Adi Kanishka'],
  ['1601-22-737-004', 'Allam Sai Deepshika'],
  ['1601-22-737-005', 'Gangadhari Vyshnavi'],
  ['1601-22-737-006', 'Giridi Sai Varshini'],
  ['1601-22-737-007', 'Jonnala Vinathi Reddy'],
  ['1601-22-737-008', 'Juweriah Abdul Raheem Mohammed'],
  ['1601-22-737-009', 'Kakarla Likhitha'],
  ['1601-22-737-010', 'Kolli Harshitha'],
  ['1601-22-737-011', 'Komakula Kavya'],
  ['1601-22-737-012', 'M Shivani'],
  ['1601-22-737-013', 'Mandala Kavya Sri'],
  ['1601-22-737-014', 'Mandalapu Srinayana'],
  ['1601-22-737-015', 'Maroju Sai Varshitha'],
  ['1601-22-737-016', 'Mullangi Nandini'],
  ['1601-22-737-017', 'Nalla Manvika'],
  ['1601-22-737-018', 'Nomula Varsha Reddy'],
  ['1601-22-737-019', 'Prakki Gayatri Naga Soujanya'],
  ['1601-22-737-020', 'Ramavath Ashwitha'],
  ['1601-22-737-021', 'Sivarathri Manasa Amrutha Satya'],
  ['1601-22-737-022', 'Smarana Sepur'],
  ['1601-22-737-023', 'Srigadha Shreya'],
  ['1601-22-737-024', 'Tanuku Pratima'],
  ['1601-22-737-025', 'Thakur Vidhatri'],
  ['1601-22-737-026', 'Todima Nikhitha'],
  ['1601-22-737-027', 'Vanteddu Akshitha'],
  ['1601-22-737-028', 'Vupparapalli Anushree'],
  ['1601-22-737-029', 'Y Deepthi Sharanya'],
  ['1601-22-737-030', 'Aithagoni Lingababu'],
  ['1601-22-737-031', 'Annam Manish Sai'],
  ['1601-22-737-032', 'Balidi Mokshith'],
  ['1601-22-737-033', 'Bandlapally Siva Kireeti Reddy'],
  ['1601-22-737-034', 'Chaitanyya Pratap Agarwal'],
  ['1601-22-737-035', 'Challa Ruthwik Reddy'],
  ['1601-22-737-036', 'Dikshant Singh'],
  ['1601-22-737-037', 'E Mithil'],
  ['1601-22-737-038', 'Enugonda Sidhartha Mahendra'],
  ['1601-22-737-039', 'Godugu Manohar Sai'],
  ['1601-22-737-040', 'Golla Sri Ram Yadav'],
  ['1601-22-737-041', 'Gourishetty Likith'],
  ['1601-22-737-042', 'Gudipati Saicharan'],
  ['1601-22-737-043', 'Inupakutika Shankar Narayana'],
  ['1601-22-737-044', 'Jagini Saiteja'],
  ['1601-22-737-045', 'Jinkathoti Yaswanth Simha'],
  ['1601-22-737-046', 'Ketavu Sathish Nayak'],
  ['1601-22-737-047', 'Kinnera Sourabh'],
  ['1601-22-737-048', 'Koyyada Vijay Simha Reddy'],
  ['1601-22-737-049', 'Manikonda Vishnu Vardhan Reddy'],
  ['1601-22-737-050', 'Nalimela Anvesh'],
  ['1601-22-737-051', 'Nellikuduru Tarun'],
  ['1601-22-737-052', 'P Subramanya Mayoor'],
  ['1601-22-737-053', 'Ponugoti Joe Rohan'],
  ['1601-22-737-054', 'Pratham Puri'],
  ['1601-22-737-055', 'Pulluru Anish'],
  ['1601-22-737-056', 'R Tomson'],
  ['1601-22-737-057', 'Ramavath Sandeep'],
  ['1601-22-737-058', 'Rohan Jadhav'],
  ['1601-22-737-059', 'Soma Nithin'],
  ['1601-22-737-060', 'Swamy Venkata Naga Murali'],
  ['1601-22-737-061', 'Thota Sai Charan Patel'],
  ['1601-22-737-062', 'U Chetan Kumor'],
  ['1601-22-737-063', 'Venkata Dwaraka Adwaith M'],
  ['1601-22-737-064', 'Venkatreddygari Varshith Reddy'],
  ['1601-22-737-065', 'Viswab Hrishik Reddy'],
  ['1601-22-737-066', 'Yenduru Umesh'],
  ['1601-21-737-028', 'Banala Sai Sathwik'],
  ['1601-22-737-301', 'Adhi Harika'],
  ['1601-22-737-302', 'Koppula Navya Sri'],
  ['1601-22-737-303', 'Pothurajula Srivardhan'],
  ['1601-22-737-304', 'Ippala Sreeja'],
  ['1601-22-737-305', 'Sheeloju Sanjay'],
  ['1601-22-737-306', 'Abdul Rasheed Safwan'],
  ['1601-22-737-307', 'Naini Shresta'],
  ['1601-21-737-045', 'Mourya Siddhartha Muntha'],
];

function getInitials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getGradient(roll) {
  const n = parseInt(roll.replace(/\D/g, '').slice(-3), 10) || 0;
  return GRADIENT_POOL[n % GRADIENT_POOL.length];
}

function getAccent(roll) {
  const n = parseInt(roll.replace(/\D/g, '').slice(-3), 10) || 0;
  return ACCENT_COLORS[n % ACCENT_COLORS.length].id;
}

export const IT1_STUDENTS = RAW.map(([roll, name]) => ({
  id: roll,
  roll,
  name,
  initials: getInitials(name),
  gradient: getGradient(roll),
  accentColor: getAccent(roll),

  // All editable fields — start empty
  photo: null,         // dataUrl when uploaded
  bio: '',
  linkedin: '',
  github: '',
  instagram: '',
  legacy: '',          // personal farewell message
  superlative: '',
  tags: [],            // custom fun tags
  timeline: [],        // [{ id, year, event }]
  approved: true,      // admin toggle
}));
