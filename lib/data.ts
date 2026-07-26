export const siteConfig = {
  name: "Education News Network",
  tagline: "Independent journalism for a connected world.",
};

export type NewsArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
  imageAlt: string;
  video?: boolean;
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "global-summit-geneva",
    category: "World",
    title: "Global Summit Opens in Geneva With Climate at the Center",
    excerpt:
      "Leaders outline emissions targets and financing for vulnerable regions as the opening sessions set the tone for negotiations.",
    author: "Anika Sharma",
    readTime: "6 min read",
    date: "April 18, 2026",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Newsroom with monitors",
    video: true,
  },
  {
    slug: "markets-rally-central-bank",
    category: "Markets",
    title: "Markets Rally as Central Bank Holds Rates Steady",
    excerpt:
      "Investors weigh forward guidance as major indices extend gains into the close across European and U.S. sessions.",
    author: "Marcus Reed",
    readTime: "5 min read",
    date: "April 18, 2026",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Trading floor",
  },
  {
    slug: "cross-border-data-flows",
    category: "Policy",
    title: "Experts Debate Regulation of Cross-Border Data Flows",
    excerpt:
      "A multilateral forum weighs privacy, security, and competition as cloud providers expand global footprints.",
    author: "James Okonkwo",
    readTime: "6 min read",
    date: "April 17, 2026",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Conference panel",
  },
  {
    slug: "carbon-targets-record-summer",
    category: "Climate",
    title: "Nations Accelerate Carbon Targets After Record Summer",
    excerpt:
      "Ministers outline new benchmarks for industry and transport as monitoring data shows sharper warming trends.",
    author: "Sofia Rinaldi",
    readTime: "7 min read",
    date: "April 17, 2026",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Wind turbines",
  },
  {
    slug: "world-championships-audiences",
    category: "Sports",
    title: "World Championships Draw Record Audiences in Prime Time",
    excerpt:
      "Broadcasters cite new camera angles and real-time analytics as viewers follow athletes across multiple venues.",
    author: "Marcus Lee",
    readTime: "5 min read",
    date: "April 16, 2026",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Stadium",
  },
  {
    slug: "congestion-pricing-transit",
    category: "Cities",
    title: "Metro Areas Pilot Congestion Pricing With Transit Credits",
    excerpt:
      "City halls pair road-use fees with expanded bus lanes and cycling corridors to shift peak-hour travel downtown.",
    author: "Elena Park",
    readTime: "8 min read",
    date: "April 16, 2026",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
    imageAlt: "City skyline",
  },
  {
    slug: "ai-tutoring-classrooms",
    category: "EdTech",
    title: "AI Tutoring Tools Expand in U.S. Classrooms After Pilot Success",
    excerpt:
      "Districts report early gains in math fluency as adaptive platforms roll out with new teacher-training requirements.",
    author: "Priya Natarajan",
    readTime: "6 min read",
    date: "April 15, 2026",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Students using laptops in classroom",
  },
  {
    slug: "teacher-shortage-rural",
    category: "K-12",
    title: "Rural Districts Offer Housing Incentives to Address Teacher Shortages",
    excerpt:
      "State grants and community partnerships aim to recruit and retain educators in underserved counties.",
    author: "Marcus Webb",
    readTime: "5 min read",
    date: "April 15, 2026",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Teacher in classroom",
  },
  {
    slug: "university-enrollment-shift",
    category: "Higher Ed",
    title: "University Enrollment Shifts as Students Weigh Skills-Based Credentials",
    excerpt:
      "Admissions offices adapt messaging as applicants balance traditional degrees with micro-credential pathways.",
    author: "Dr. James Chen",
    readTime: "7 min read",
    date: "April 14, 2026",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "University campus",
  },
  {
    slug: "literacy-curriculum-reform",
    category: "Policy",
    title: "States Overhaul Literacy Curriculum With Science-of-Reading Mandates",
    excerpt:
      "New training requirements and instructional materials reach thousands of elementary teachers this fall.",
    author: "Sofia Rinaldi",
    readTime: "6 min read",
    date: "April 14, 2026",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Children reading books",
  },
  {
    slug: "student-wellbeing-programs",
    category: "Wellbeing",
    title: "Schools Expand Mental Health Programs as Student Wellbeing Data Surges",
    excerpt:
      "Counselor ratios improve in several states as districts invest in peer-support networks and telehealth access.",
    author: "Elena Park",
    readTime: "5 min read",
    date: "April 13, 2026",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Students collaborating",
  },
  {
    slug: "international-student-visas",
    category: "International",
    title: "International Student Visa Processing Times Improve Ahead of Fall Term",
    excerpt:
      "Embassies prioritize education applicants as universities report stronger yield from overseas recruitment.",
    author: "Anika Sharma",
    readTime: "4 min read",
    date: "April 13, 2026",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
    imageAlt: "International students on campus",
  },
];

export const panelDiscussions = [
  {
    episode: "EP 01",
    duration: "48:12",
    topic: "Technology",
    title: "Rebuilding Higher Education for the Post-Pandemic Generation",
    speakers: "Panel of 5 University Deans",
    image: "https://img.youtube.com/vi/p-uizqBSK9Q/hqdefault.jpg",
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    episode: "EP 02",
    duration: "52:06",
    topic: "Policy",
    title: "Funding Equity: What Districts Need Next",
    speakers: "UNESCO Education Roundtable",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85",
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    episode: "EP 03",
    duration: "44:30",
    topic: "Literacy",
    title: "Literacy in a Screen-First World",
    speakers: "Priya Natarajan & Sofia Rinaldi",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85",
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    episode: "EP 04",
    duration: "56:04",
    topic: "Higher Ed",
    title: "College Access After the Pandemic",
    speakers: "Marcus Webb & Dr. James Chen",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    episode: "EP 05",
    duration: "41:18",
    topic: "Wellbeing",
    title: "Mental Health Supports for Teens in School",
    speakers: "Dr. James Chen & Elena Park",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=85",
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
];

export const categories = [
  { name: "World", count: 24 },
  { name: "Markets", count: 18 },
  { name: "Policy", count: 15 },
  { name: "Climate", count: 12 },
  { name: "Education", count: 21 },
  { name: "Trending", count: 9, href: "/trending-news" },
];

export type EventEdition = {
  id: string;
  title: string;
  /** Filter label shown in Category dropdown — unique per year */
  category: string;
  year: 2025 | 2026;
  date: string;
  location: string;
};

export type SpeakerProfile = {
  name: string;
  role: string;
  image: string;
  eventId: EventEdition["id"];
  category: string;
  year: EventEdition["year"];
  youtube: string;
};

export type SponsorProfile = {
  name: string;
  tier: string;
  image: string;
  eventId: EventEdition["id"];
  category: string;
  year: EventEdition["year"];
  youtube: string;
};

/** Categories for each year — Category dropdown updates from this when Year changes */
export const eventCategoriesByYear: Record<number, string[]> = {
  2026: [
    "North Educators' Summit & Awards",
    "Maharashtra Educators' Summit & Awards",
    "South India Educators' Summit",
    "14th National Conference on K-12 Leadership",
  ],
  2025: [
    "Maharashtra & North Educators' Summit & Awards",
    "South India Educators' Summit",
    "13th National Conference on K-12 Leadership",
    "Bengaluru Leadership Roundtable",
  ],
};

export const eventEditions: EventEdition[] = [
  {
    id: "north-summit-2026",
    title: "North Educators' Summit & Awards 2026",
    category: "North Educators' Summit & Awards",
    year: 2026,
    date: "September 10, 2026",
    location: "Gurugram",
  },
  {
    id: "maharashtra-summit-2026",
    title: "Maharashtra Educators' Summit & Awards 2026",
    category: "Maharashtra Educators' Summit & Awards",
    year: 2026,
    date: "September 29, 2026",
    location: "Mumbai",
  },
  {
    id: "south-summit-2026",
    title: "South India Educators' Summit 2026",
    category: "South India Educators' Summit",
    year: 2026,
    date: "October 7, 2026",
    location: "Hyderabad",
  },
  {
    id: "national-k12-2026",
    title: "14th National Conference on K-12 Leadership 2026",
    category: "14th National Conference on K-12 Leadership",
    year: 2026,
    date: "November 2026",
    location: "Bengaluru",
  },
  {
    id: "maha-north-summit-2025",
    title: "Maharashtra & North Educators' Summit & Awards 2025",
    category: "Maharashtra & North Educators' Summit & Awards",
    year: 2025,
    date: "September 12, 2025",
    location: "Mumbai",
  },
  {
    id: "south-summit-2025",
    title: "South India Educators' Summit 2025",
    category: "South India Educators' Summit",
    year: 2025,
    date: "October 2025",
    location: "Hyderabad",
  },
  {
    id: "national-k12-2025",
    title: "13th National Conference on K-12 Leadership 2025",
    category: "13th National Conference on K-12 Leadership",
    year: 2025,
    date: "November 2025",
    location: "Bengaluru",
  },
  {
    id: "bengaluru-roundtable-2025",
    title: "Bengaluru Leadership Roundtable 2025",
    category: "Bengaluru Leadership Roundtable",
    year: 2025,
    date: "December 2025",
    location: "Bengaluru",
  },
];

export function getEventYears(): number[] {
  return Array.from(new Set(eventEditions.map((e) => e.year))).sort((a, b) => b - a);
}

export function getCategoriesForYear(year: string | number): string[] {
  if (year === "All" || year === "") {
    return Array.from(new Set(eventEditions.map((e) => e.category)));
  }
  const y = Number(year);
  return eventCategoriesByYear[y] ?? eventEditions.filter((e) => e.year === y).map((e) => e.category);
}

export const speakers: SpeakerProfile[] = [
  {
    name: "Dr. James Chen",
    role: "Chief Policy Officer, Assessment & Accountability",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=640&q=80",
    eventId: "north-summit-2026",
    category: "North Educators' Summit & Awards",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Anika Sharma",
    role: "Global Affairs Editor, ENN",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&q=80",
    eventId: "maharashtra-summit-2026",
    category: "Maharashtra Educators' Summit & Awards",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Priya Natarajan",
    role: "Professor of Learning Sciences",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80",
    eventId: "south-summit-2026",
    category: "South India Educators' Summit",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Marcus Webb",
    role: "Director, Data & AI Literacy Programs",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80",
    eventId: "national-k12-2026",
    category: "14th National Conference on K-12 Leadership",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Elena Vasquez",
    role: "Head of Community Partnerships, ENN Live",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&q=80",
    eventId: "maha-north-summit-2025",
    category: "Maharashtra & North Educators' Summit & Awards",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Dr. Sofia Rinaldi",
    role: "Director, Literacy Innovation Lab",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=80",
    eventId: "south-summit-2025",
    category: "South India Educators' Summit",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Ethan Cole",
    role: "Founder, Civic Learning Foundation",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
    eventId: "national-k12-2025",
    category: "13th National Conference on K-12 Leadership",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Mei Tanaka",
    role: "Senior Advisor, UNESCO Education Unit",
    image: "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=640&q=80",
    eventId: "bengaluru-roundtable-2025",
    category: "Bengaluru Leadership Roundtable",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
];

export const sponsors: SponsorProfile[] = [
  {
    name: "International Baccalaureate",
    tier: "Presenting Sponsor",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    eventId: "north-summit-2026",
    category: "North Educators' Summit & Awards",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "My School Admission",
    tier: "Gold Sponsor",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    eventId: "maharashtra-summit-2026",
    category: "Maharashtra Educators' Summit & Awards",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "EduScale Cloud",
    tier: "Innovation Partner",
    image: "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=800&q=80",
    eventId: "south-summit-2026",
    category: "South India Educators' Summit",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Knowledge Plus",
    tier: "Learning Partner",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    eventId: "national-k12-2026",
    category: "14th National Conference on K-12 Leadership",
    year: 2026,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "LiveLife Education",
    tier: "Gold Sponsor",
    image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80",
    eventId: "maha-north-summit-2025",
    category: "Maharashtra & North Educators' Summit & Awards",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "ClassBridge Labs",
    tier: "Learning Partner",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    eventId: "south-summit-2025",
    category: "South India Educators' Summit",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Future Faculty Fund",
    tier: "Community Sponsor",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    eventId: "national-k12-2025",
    category: "13th National Conference on K-12 Leadership",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
  {
    name: "Policy Connect Forum",
    tier: "Strategic Sponsor",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    eventId: "bengaluru-roundtable-2025",
    category: "Bengaluru Leadership Roundtable",
    year: 2025,
    youtube: "https://www.youtube.com/watch?v=p-uizqBSK9Q",
  },
];

export const events = [
  {
    tag: "2026",
    title: "North Educators' Summit & Awards",
    excerpt: "Flagship North India summit with school leaders, panels, and merit awards in Gurugram.",
    date: "September 10, 2026",
    location: "Gurugram",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
  },
  {
    tag: "2026",
    title: "Maharashtra Educators' Summit & Awards",
    excerpt: "Celebrate excellence across Maharashtra schools with awards, workshops, and networking.",
    date: "September 29, 2026",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
  },
  {
    tag: "2026",
    title: "South India Educators' Summit",
    excerpt: "Regional summit covering innovation, assessments, and community leadership in the South.",
    date: "October 7, 2026",
    location: "Hyderabad",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
  },
  {
    tag: "2026",
    title: "14th National Conference on K-12 Leadership",
    excerpt: "National conference focused on leadership pipelines, governance, and future-ready schools.",
    date: "November 2026",
    location: "Bengaluru",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
  },
];
