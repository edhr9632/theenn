export type WeeklyIssue = {
  slug: string;
  dateLabel: string;
  weekday: string;
  title: string;
  tagline: string;
  coverImage: string;
  pdfUrl: string;
  highlights: { label: string; tone: "red" | "blue" | "purple" | "teal" | "ink" }[];
  featured?: boolean;
};

export const weeklyIssues: WeeklyIssue[] = [
  {
    slug: "aug-week-1-2025",
    dateLabel: "09.08.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "Smart reads, happy feeds — Bengaluru’s week in a peek!",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/aug-week-1-2025.pdf",
    featured: true,
    highlights: [
      { label: "Bengaluru 360°", tone: "red" },
      { label: "Karnataka", tone: "blue" },
      { label: "Funorama", tone: "purple" },
      { label: "PassionHive", tone: "ink" },
      { label: "Academia", tone: "teal" },
      { label: "Mind Maze", tone: "red" },
    ],
  },
  {
    slug: "aug-week-0-2025",
    dateLabel: "02.08.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "City schools, careers, and weekend culture in one wrap.",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/aug-week-0-2025.pdf",
    highlights: [
      { label: "Bengaluru 360°", tone: "red" },
      { label: "Academia", tone: "teal" },
      { label: "Funorama", tone: "purple" },
    ],
  },
  {
    slug: "july-week-4-2025",
    dateLabel: "26.07.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "Admissions buzz, campus stories, and creative classrooms.",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/july-week-4-2025.pdf",
    highlights: [
      { label: "Karnataka", tone: "blue" },
      { label: "PassionHive", tone: "ink" },
      { label: "Mind Maze", tone: "red" },
    ],
  },
  {
    slug: "july-week-3-2025",
    dateLabel: "19.07.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "Policy notes, parent tips, and student spotlights.",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/july-week-3-2025.pdf",
    highlights: [
      { label: "Bengaluru 360°", tone: "red" },
      { label: "Academia", tone: "teal" },
      { label: "Funorama", tone: "purple" },
    ],
  },
  {
    slug: "july-week-2-2025",
    dateLabel: "12.07.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "From board exams to arts festivals — the city’s education week.",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/july-week-2-2025.pdf",
    highlights: [
      { label: "Karnataka", tone: "blue" },
      { label: "PassionHive", tone: "ink" },
      { label: "Academia", tone: "teal" },
    ],
  },
  {
    slug: "july-week-1-2025",
    dateLabel: "05.07.2025",
    weekday: "Saturday",
    title: "Weekly Bengaluru News",
    tagline: "A fresh week of smart reads for Bengaluru families.",
    coverImage: "/images/weekly/aug-week-1.png",
    pdfUrl: "/weekly-pdfs/july-week-1-2025.pdf",
    highlights: [
      { label: "Bengaluru 360°", tone: "red" },
      { label: "Funorama", tone: "purple" },
      { label: "Mind Maze", tone: "red" },
    ],
  },
];
