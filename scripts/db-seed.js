/**
 * Seed PostgreSQL with sample home page content.
 * Usage: node scripts/db-seed.js
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const topEducation = [
  {
    slug: "ai-tutoring-classrooms",
    title: "AI Tutoring Tools Expand in U.S. Classrooms After Pilot Success",
    excerpt:
      "Districts report early gains in math fluency as adaptive tutors supplement teacher-led instruction in grades 3–8.",
    author: "Dr. Anika Sharma",
    category: "EdTech",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
    video: true,
    sort: 0,
  },
  {
    slug: "teacher-shortage-rural",
    title: "Rural Districts Pilot Housing Incentives to Recruit Teachers",
    excerpt: "School boards pair affordable housing with signing bonuses to fill vacancies in remote counties.",
    author: "Elena Park",
    category: "Policy",
    image: "https://images.unsplash.com/photo-1577896115880-74bca9099789?auto=format&fit=crop&w=900&q=80",
    sort: 1,
  },
  {
    slug: "stem-girls-initiative",
    title: "STEM Programs for Girls See Record Enrollment Across India",
    excerpt: "After-school labs and mentorship networks report a 40% jump in participation this academic year.",
    author: "Priya Menon",
    category: "K-12",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
    sort: 2,
  },
  {
    slug: "university-enrollment-shift",
    title: "University Enrollment Shifts as Students Weigh Skills-Based Credentials",
    excerpt: "Admissions offices adapt messaging as applicants balance traditional degrees with micro-credentials.",
    author: "Dr. James Chen",
    category: "Higher Ed",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80",
    sort: 3,
  },
  {
    slug: "early-literacy-screens",
    title: "Early Literacy Screenings Expand in Primary Grades Nationwide",
    excerpt: "States roll out universal reading checks in kindergarten and first grade to catch gaps earlier.",
    author: "Marcus Reed",
    category: "K-12",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    sort: 4,
  },
];

const daily = topEducation.concat([
  {
    slug: "school-nutrition-funding",
    title: "School Nutrition Programs Secure Multi-Year Federal Funding",
    excerpt: "Districts plan expanded breakfast programs as new grants cover equipment and staffing.",
    author: "ENN Desk",
    category: "Policy",
    image: "https://images.unsplash.com/photo-1497633762875-8ee325168688?auto=format&fit=crop&w=900&q=80",
    sort: 5,
  },
]);

const trending = daily.slice(0, 6).reverse().map((item, index) => ({ ...item, sort: index }));

async function upsertArticle(client, section, item) {
  await client.query(
    `INSERT INTO news_articles (
      slug, section, title, excerpt, author, read_time, category_label,
      image_url, image_alt, status, has_video, publish_date, sort_order, published_at
    ) VALUES (
      $1, $2, $3, $4, $5, '6 min read', $6,
      $7, $8, 'published', $9, CURRENT_DATE, $10, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      section = EXCLUDED.section,
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      author = EXCLUDED.author,
      category_label = EXCLUDED.category_label,
      image_url = EXCLUDED.image_url,
      image_alt = EXCLUDED.image_alt,
      has_video = EXCLUDED.has_video,
      sort_order = EXCLUDED.sort_order,
      status = 'published',
      updated_at = NOW()`,
    [
      item.slug,
      section,
      item.title,
      item.excerpt,
      item.author,
      item.category,
      item.image,
      item.title,
      Boolean(item.video),
      item.sort ?? 0,
    ],
  );
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    for (const item of topEducation) await upsertArticle(client, "top_education", item);
    for (const item of daily) await upsertArticle(client, "daily", item);
    for (const item of trending) await upsertArticle(client, "trending", item);

    await client.query(
      `INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         eyebrow = EXCLUDED.eyebrow,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         cta_label = EXCLUDED.cta_label,
         cta_url = EXCLUDED.cta_url,
         enabled = TRUE,
         updated_at = NOW()`,
      [
        "tv_schedule",
        "TV Schedule",
        "Knowledge Plus - Education News Network",
        "Hosted by Vibha Raj",
        "Watch our live discussion @3PM",
        "#",
        "tv_schedule",
      ],
    );

    await client.query(
      `INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         eyebrow = EXCLUDED.eyebrow,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         cta_label = EXCLUDED.cta_label,
         cta_url = EXCLUDED.cta_url,
         enabled = TRUE,
         updated_at = NOW()`,
      [
        "partner_msa",
        "Partner - Advertisement",
        "Looking for school admission? Visit MSA",
        "My School Admission helps parents discover schools, compare options, and apply with ease.",
        "Visit MSA",
        "https://myschooladmission.com/",
        "partner",
      ],
    );

    console.log("Seed complete: top education, daily, trending, promo banners.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
