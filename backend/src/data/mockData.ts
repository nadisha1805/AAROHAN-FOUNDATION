export type Cause = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: string;
};

export type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
  causeId: string;
  startDate: string;
  endDate: string;
  status: string;
  featured: boolean;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  publishedAt: string;
  status: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type ImpactUpdate = {
  id: string;
  title: string;
  description: string;
  image: string;
  metricValue: string;
  metricLabel: string;
  publishedAt: string;
};

export const causes: Cause[] = [
  {
    id: 'cause-edu',
    name: 'Education for All',
    slug: 'education-for-all',
    description: 'Supporting school access, digital learning, and mentorship for children and youth in underserved communities.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'cause-health',
    name: 'Healthcare & Medical Support',
    slug: 'healthcare-medical-support',
    description: 'Helping families access essential health checkups, medicines, and timely care when it matters most.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'cause-food',
    name: 'Food & Nutrition',
    slug: 'food-nutrition',
    description: 'Providing nutritious meals and emergency food support for vulnerable individuals and families.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'cause-women',
    name: 'Women Empowerment',
    slug: 'women-empowerment',
    description: 'Creating safe opportunities, skill building, and confidence for women-led growth and independence.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'cause-child',
    name: 'Child Welfare',
    slug: 'child-welfare',
    description: 'Protecting children through care, education, emergency response, and joyful community support.',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  {
    id: 'cause-community',
    name: 'Community Development',
    slug: 'community-development',
    description: 'Strengthening local resilience through inclusive programs, sanitation, and neighborhood engagement.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
];

export const campaigns: Campaign[] = [
  {
    id: 'campaign-school-kits',
    title: 'School Kit Drive',
    slug: 'school-kit-drive',
    description: 'Provide backpacks, notebooks, and dignity kits for students beginning a fresh academic year.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    goalAmount: 20000,
    raisedAmount: 12850,
    causeId: 'cause-edu',
    startDate: '2026-05-01',
    endDate: '2026-08-15',
    status: 'active',
    featured: true,
  },
  {
    id: 'campaign-medicare',
    title: 'Health for Every Family',
    slug: 'health-for-every-family',
    description: 'Fund mobile health camps and essential treatment support for families with limited access to care.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    goalAmount: 35000,
    raisedAmount: 21450,
    causeId: 'cause-health',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    status: 'active',
    featured: true,
  },
  {
    id: 'campaign-meals',
    title: 'Meals of Hope',
    slug: 'meals-of-hope',
    description: 'Support nutritious meal distribution and emergency food assistance for vulnerable households.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    goalAmount: 15000,
    raisedAmount: 8890,
    causeId: 'cause-food',
    startDate: '2026-02-10',
    endDate: '2026-07-20',
    status: 'active',
    featured: false,
  },
  {
    id: 'campaign-skills',
    title: 'Women in Action',
    slug: 'women-in-action',
    description: 'Expand livelihood workshops and support for women building a safer and more stable future.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    goalAmount: 25000,
    raisedAmount: 18080,
    causeId: 'cause-women',
    startDate: '2026-03-15',
    endDate: '2026-10-31',
    status: 'upcoming',
    featured: false,
  }
];

export const stories: Story[] = [
  {
    id: 'story-rani',
    title: 'Rani’s Journey Back to School',
    slug: 'ranis-journey-back-to-school',
    description: 'After receiving school support, Rani could return to the classroom with confidence and hope.',
    content: 'This story is sample demonstration content used for Milestone 1. Replace it with approved beneficiary stories when available.',
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-06-10',
    status: 'published',
  },
  {
    id: 'story-community',
    title: 'A Health Camp That Changed Lives',
    slug: 'health-camp-that-changed-lives',
    description: 'A community health outreach opened pathways to treatment, care, and renewed confidence.',
    content: 'This story is sample demonstration content used for Milestone 1. Replace it with verified impact stories when available.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-06-12',
    status: 'published',
  },
];

export const eventItems: EventItem[] = [
  {
    id: 'event-health-drive',
    title: 'Community Health & Wellness Drive',
    slug: 'community-health-wellness-drive',
    description: 'A public health and awareness event focused on preventive care, screenings, and health education.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    location: 'Bengaluru Community Center',
    startDate: '2026-07-18T10:00:00.000Z',
    endDate: '2026-07-18T15:00:00.000Z',
    status: 'upcoming',
  },
  {
    id: 'event-education-fair',
    title: 'Education Access Fair',
    slug: 'education-access-fair',
    description: 'A community fair connecting families with learning resources, support, and guidance on education access.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    location: 'Green Valley School',
    startDate: '2026-08-05T09:00:00.000Z',
    endDate: '2026-08-05T13:00:00.000Z',
    status: 'upcoming',
  },
];

export const impactUpdates: ImpactUpdate[] = [
  {
    id: 'impact-people',
    title: 'People Supported',
    description: 'Demonstration metric for a community support program. Replace with foundation-approved figures when available.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    metricValue: '12,500+',
    metricLabel: 'People supported',
    publishedAt: '2026-05-15',
  },
  {
    id: 'impact-communities',
    title: 'Communities Reached',
    description: 'Demonstration metric for outreach and local intervention initiatives.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    metricValue: '28',
    metricLabel: 'Communities reached',
    publishedAt: '2026-05-16',
  },
  {
    id: 'impact-volunteers',
    title: 'Volunteers Engaged',
    description: 'Demonstration metric for volunteer participation and community action.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    metricValue: '1,200+',
    metricLabel: 'Volunteers engaged',
    publishedAt: '2026-05-17',
  },
];

export const faqs = [
  {
    question: 'What is AAROHAN Foundation?',
    answer: 'AAROHAN Foundation is a charitable organization dedicated to improving lives through compassionate, community-first support across education, health, nutrition, women empowerment, and child welfare.',
  },
  {
    question: 'How can I support the foundation?',
    answer: 'You can contribute through donations, volunteering, spreading awareness, or participating in campaigns and community events.',
  },
  {
    question: 'How can I volunteer?',
    answer: 'Use the volunteer form on the volunteer page and share your interests, skills, and availability. AAROHAN Foundation will review your application.',
  },
  {
    question: 'How are donations used?',
    answer: 'Donations support approved causes, campaign objectives, field programs, and community outreach initiatives. Details are communicated through campaigns and impact updates.',
  },
  {
    question: 'How can I participate in campaigns?',
    answer: 'Browse active campaigns on the Campaigns page and use the donation CTA or contact the foundation for more information.',
  },
  {
    question: 'How can I contact the foundation?',
    answer: 'Use the Contact Us page or reach out via the placeholder email and phone details listed there.',
  },
];
