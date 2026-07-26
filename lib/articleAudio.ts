import type { NewsArticle } from "@/lib/data";

/** Builds a news-anchor style spoken script for one article — not a raw read-aloud. */
export function buildArticleNewsScript(article: NewsArticle) {
  const categoryLine = categoryIntro(article.category);
  const contextLine = educationContext(article);

  return [
    "You're listening to Education News Network.",
    `${article.category} coverage for ${article.date}.`,
    `Our story: ${article.title}.`,
    `Reporting by ${article.author}.`,
    article.excerpt.endsWith(".") ? article.excerpt : `${article.excerpt}.`,
    categoryLine,
    contextLine,
    `Independent journalism like this helps parents, educators, and policymakers understand what is changing in education.`,
    `That was ${article.title}, from Education News Network.`,
    "Keep watching Education News Network for more updates.",
    "For enquiries, please visit our Contact Us page, or write to us through the enquiry form on Education News Network.",
    "Thank you for listening.",
  ].join(" ");
}

function categoryIntro(category: string) {
  switch (category) {
    case "EdTech":
      return "This report looks at how new classroom technology is reaching students and teachers.";
    case "K-12":
      return "The story focuses on schools, teachers, and students in the K through 12 system.";
    case "Higher Ed":
      return "This update covers colleges, universities, and pathways after school.";
    case "Policy":
      return "Education leaders are watching how this policy shift could change classrooms and funding.";
    case "Wellbeing":
      return "Schools are paying close attention to student mental health and support systems.";
    case "International":
      return "The report highlights how global education trends are affecting students and campuses.";
    case "Climate":
      return "Educators are connecting climate policy to curriculum, careers, and community learning.";
    case "World":
      return "Global developments like this often shape education debates at home.";
    case "Markets":
      return "Market moves can influence school budgets, university endowments, and education investment.";
    case "Cities":
      return "City policy decisions frequently reshape how students travel, learn, and access opportunity.";
    case "Sports":
      return "Sports coverage also touches schools, youth programs, and campus life.";
    default:
      return "Here is why this story matters for the education community.";
  }
}

function educationContext(article: NewsArticle) {
  const text = `${article.title} ${article.excerpt}`.toLowerCase();

  if (/\b(ai|tutoring|edtech|digital|platform)\b/.test(text)) {
    return "Districts and teachers are weighing training, access, and classroom impact as tools scale.";
  }
  if (/\b(teacher|shortage|housing|recruit)\b/.test(text)) {
    return "Communities are searching for practical ways to attract and keep educators where they are needed most.";
  }
  if (/\b(literacy|reading|curriculum)\b/.test(text)) {
    return "Classroom practice, teacher training, and instructional materials are at the center of the debate.";
  }
  if (/\b(university|college|enrollment|credential)\b/.test(text)) {
    return "Students and families are rethinking what a valuable education pathway looks like after school.";
  }
  if (/\b(wellbeing|mental health|counselor)\b/.test(text)) {
    return "Schools say stronger support systems can help students stay engaged and ready to learn.";
  }
  if (/\b(visa|international student)\b/.test(text)) {
    return "Campuses and families are watching timelines closely ahead of the next academic term.";
  }

  return `In about ${article.readTime.replace(" read", "")}, ENN walks through what readers need to know next.`;
}

export function estimateListenMinutes(script: string) {
  const words = script.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 150));
  return `${minutes} min listen`;
}
