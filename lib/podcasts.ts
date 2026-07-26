export type PodcastShow = {
  slug: string;
  title: string;
  host: string;
  schedule: string;
  description: string;
  image: string;
  imageAlt: string;
  episodes: {
    title: string;
    date: string;
    duration: string;
    summary: string;
  }[];
};

export const podcastShows: PodcastShow[] = [
  {
    slug: "knowledge-plus",
    title: "Knowledge Plus",
    host: "Vibha Raj",
    schedule: "Weekdays · 3:00 PM ET",
    description:
      "A daily broadcast on policy shifts, classroom innovation, and the stories shaping education across the country.",
    image: "https://images.unsplash.com/photo-1478737273-784177cc6c7f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Podcast studio microphone",
    episodes: [
      {
        title: "How districts are scaling AI literacy programs",
        date: "April 18, 2026",
        duration: "28 min",
        summary: "Superintendents share rollout plans, teacher training, and guardrails for responsible classroom use.",
      },
      {
        title: "Funding equity after the latest federal guidance",
        date: "April 17, 2026",
        duration: "32 min",
        summary: "Policy analysts break down what new guidance means for Title I schools and rural districts.",
      },
      {
        title: "Inside the college access counseling crunch",
        date: "April 16, 2026",
        duration: "26 min",
        summary: "Counselors discuss caseloads, FAFSA delays, and community partnerships easing the burden.",
      },
    ],
  },
  {
    slug: "enn-daily-brief",
    title: "ENN Daily Brief",
    host: "Marcus Reed",
    schedule: "Every morning · 7:00 AM ET",
    description:
      "Ten minutes of context on the headlines educators, parents, and policymakers need before the day begins.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Newsroom monitors",
    episodes: [
      {
        title: "Markets steady as central banks hold rates",
        date: "April 18, 2026",
        duration: "11 min",
        summary: "What steady rates mean for school bonds, university endowments, and ed-tech valuations.",
      },
      {
        title: "States accelerate literacy curriculum reforms",
        date: "April 17, 2026",
        duration: "10 min",
        summary: "A quick guide to science-of-reading mandates reaching classrooms this fall.",
      },
      {
        title: "International student visa timelines improve",
        date: "April 16, 2026",
        duration: "9 min",
        summary: "Embassy updates and what universities are telling admitted students ahead of fall term.",
      },
    ],
  },
  {
    slug: "classroom-voices",
    title: "Classroom Voices",
    host: "Priya Natarajan",
    schedule: "Thursdays · 6:00 PM ET",
    description:
      "Teachers, students, and school leaders share ground-level stories from classrooms across the ENN network.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Students in classroom",
    episodes: [
      {
        title: "A rural district's housing plan for new teachers",
        date: "April 17, 2026",
        duration: "34 min",
        summary: "Educators describe incentives, community buy-in, and early retention results.",
      },
      {
        title: "Peer mental health networks in high school",
        date: "April 10, 2026",
        duration: "29 min",
        summary: "Student leaders and counselors on building supports that actually get used.",
      },
      {
        title: "Project-based learning after the pandemic",
        date: "April 3, 2026",
        duration: "31 min",
        summary: "Teachers reflect on what stuck, what faded, and what families want to see next.",
      },
    ],
  },
];

export function getPodcastBySlug(slug: string) {
  return podcastShows.find((show) => show.slug === slug);
}
