/**
 * Keyword strategy for Education News Network (theenn.com).
 * Prioritised by India search demand for education news / exams / schools / summits,
 * then brand terms. Volumes are directional (India, 2025–2026 research).
 */

/** Highest-demand head terms for an education news publisher in India */
export const CORE_HIGH_VOLUME = [
  "education news",
  "education news India",
  "CBSE news",
  "CBSE result",
  "school education news",
  "NEET news",
  "JEE Main news",
  "board exam news",
  "school admission 2026",
  "education policy India",
  "K-12 education",
  "National Education Policy",
] as const;

export const BRAND_KEYWORDS = [
  "Education News Network",
  "ENN",
  "theenn",
  "Education Today",
  "Education Today magazine",
] as const;

export const PAGE_SEO = {
  home: {
    title: "Education News India — CBSE, Schools, Exams & Summits",
    description:
      "Latest education news India: CBSE updates, school admissions, NEET & JEE headlines, education policy, educators’ summits, and weekly magazines from Education News Network.",
    keywords: [
      ...CORE_HIGH_VOLUME,
      ...BRAND_KEYWORDS,
      "educators summit",
      "daily education news",
      "weekly education magazine",
    ],
  },
  news: {
    title: "Daily Education News India — CBSE, Schools & Policy",
    description:
      "Daily education news from across India — CBSE and board exam updates, school stories, NEET & JEE coverage, and education policy briefs from Education News Network.",
    keywords: [
      "daily education news",
      "education news India",
      "CBSE news today",
      "school news India",
      "education journalism",
      "board exam news",
      ...BRAND_KEYWORDS,
    ],
  },
  trending: {
    title: "Trending Education News — CBSE, NEET, JEE & Schools",
    description:
      "Trending education headlines India is reading now — CBSE results buzz, NEET and JEE updates, school admissions, and viral education stories on Education News Network.",
    keywords: [
      "trending education news",
      "CBSE trending",
      "NEET news today",
      "JEE news",
      "viral school news",
      "education headlines India",
      ...BRAND_KEYWORDS,
    ],
  },
  press: {
    title: "Education Press Releases — Schools, Summits & Awards",
    description:
      "Official education press releases from schools, educators’ summits, awards, and Education Today programmes — published by Education News Network.",
    keywords: [
      "education press release",
      "school press release India",
      "educators summit press release",
      "education awards announcement",
      "media release education",
      ...BRAND_KEYWORDS,
    ],
  },
  weekly: {
    title: "Weekly Education Magazine — Education Today Bengaluru",
    description:
      "Read and download Education Today weekly education magazine editions for Bengaluru and more cities — school news, leadership, and local education coverage from ENN.",
    keywords: [
      "weekly education magazine",
      "Education Today magazine",
      "Bengaluru education news",
      "education magazine India",
      "school magazine weekly",
      ...BRAND_KEYWORDS,
    ],
  },
  panels: {
    title: "Education Panel Discussions — Leaders & Policymakers",
    description:
      "Watch education panel discussions with school leaders, policymakers, and experts on K-12 leadership, NEP, and school improvement — from Education News Network.",
    keywords: [
      "education panel discussion",
      "K-12 leadership panel",
      "education policy debate",
      "school leaders discussion",
      "NEP panel discussion",
      ...BRAND_KEYWORDS,
    ],
  },
  podcasts: {
    title: "Education Podcasts India — Knowledge Plus & More",
    description:
      "Listen to education podcasts from Education News Network — Knowledge Plus and shows on schools, leadership, exams, and education policy across India.",
    keywords: [
      "education podcasts India",
      "education podcast",
      "Knowledge Plus podcast",
      "school leadership podcast",
      "education news audio",
      ...BRAND_KEYWORDS,
    ],
  },
  events: {
    title: "Educators Summit & Education Events India 2026",
    description:
      "Educators’ summits, K-12 leadership conferences, and education awards across India — North, Maharashtra, South, and National Conference from Education Today & ENN.",
    keywords: [
      "educators summit",
      "educators summit 2026",
      "K-12 leadership conference",
      "education events India",
      "North Educators Summit",
      "South India Educators Summit",
      "Maharashtra Educators Summit",
      "National Conference on K-12 Leadership",
      ...BRAND_KEYWORDS,
    ],
  },
  speakers: {
    title: "Educators Summit Speakers — Education Leaders India",
    description:
      "Meet speakers from Education Today educators’ summits and K-12 leadership conferences — principals, policymakers, and education innovators.",
    keywords: [
      "educators summit speakers",
      "education conference speakers",
      "K-12 leadership speakers",
      "school leaders India",
      ...BRAND_KEYWORDS,
    ],
  },
  sponsors: {
    title: "Educators Summit Sponsors & Education Partners",
    description:
      "Sponsors and partners of Education Today educators’ summits and national K-12 conferences — brands supporting school leadership across India.",
    keywords: [
      "educators summit sponsors",
      "education event sponsors",
      "K-12 conference partners",
      "education summit partners",
      ...BRAND_KEYWORDS,
    ],
  },
  pressBits: {
    title: "Press Bits — Educators Summit Reels & Event Videos",
    description:
      "Short Press Bits and event reels from educators’ summits and education conferences — highlights from Education News Network events.",
    keywords: [
      "educators summit videos",
      "education event reels",
      "press bits education",
      "summit highlights",
      ...BRAND_KEYWORDS,
    ],
  },
  insights: {
    title: "Education Insights — Policy, Schools & Leadership Analysis",
    description:
      "In-depth education insights on school leadership, National Education Policy, admissions, and K-12 trends — analysis from Education News Network.",
    keywords: [
      "education insights",
      "education policy analysis",
      "National Education Policy",
      "school leadership insights",
      "K-12 education analysis",
      ...BRAND_KEYWORDS,
    ],
  },
  about: {
    title: "About Education News Network — Education Journalism India",
    description:
      "About Education News Network (ENN) and Education Today — independent education journalism covering schools, CBSE, exams, summits, and policy across India.",
    keywords: [
      "about Education News Network",
      "Education Today",
      "education journalism India",
      "ENN news",
      ...BRAND_KEYWORDS,
    ],
  },
  contact: {
    title: "Contact Education News Network — Bengaluru Office",
    description:
      "Contact Education News Network in Bengaluru for education news tips, summit partnerships, subscriptions, and press inquiries.",
    keywords: [
      "contact Education News Network",
      "Education Today Bengaluru contact",
      "education news tip line",
      "ENN contact",
      ...BRAND_KEYWORDS,
    ],
  },
  newsletter: {
    title: "Education News Newsletter — Daily Briefing India",
    description:
      "Subscribe to the Education News Network newsletter for daily education news India, CBSE updates, and weekly school leadership highlights.",
    keywords: [
      "education newsletter India",
      "education news email",
      "CBSE news newsletter",
      "school news briefing",
      ...BRAND_KEYWORDS,
    ],
  },
  subscribe: {
    title: "Subscribe to Education News Network",
    description:
      "Subscribe to Education News Network for unlimited education news India, weekly magazines, summit access benefits, and member briefings.",
    keywords: [
      "subscribe education news",
      "Education Today subscription",
      "ENN membership",
      "education magazine subscribe",
      ...BRAND_KEYWORDS,
    ],
  },
  ask: {
    title: "Ask ENN — AI Education News Answers India",
    description:
      "Ask ENN for instant answers on education news India — CBSE, schools, exams, weekly magazines, and summit coverage from Education News Network.",
    keywords: [
      "ask ENN",
      "education news AI",
      "education news search",
      "CBSE news AI",
      "education headlines India",
      ...BRAND_KEYWORDS,
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Education News Network collects, uses, and protects your information on theenn.com.",
    keywords: ["ENN privacy policy", "Education News Network privacy", "theenn privacy"],
  },
  terms: {
    title: "Terms of Use",
    description: "Terms of use for Education News Network (theenn.com) websites and related services.",
    keywords: ["ENN terms of use", "Education News Network terms", "theenn terms"],
  },
  ethics: {
    title: "Ethics Policy — Education Journalism Standards",
    description:
      "Editorial ethics and journalism standards for Education News Network — fairness, accuracy, and independence in education reporting.",
    keywords: ["education journalism ethics", "ENN ethics policy", "editorial standards"],
  },
} as const;

/** Extra keywords merged into every article page for topical relevance */
export const ARTICLE_SEO_KEYWORDS = [
  "education news India",
  "education news",
  "CBSE news",
  "school education",
  "Education News Network",
  "ENN",
] as const;
