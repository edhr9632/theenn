const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const COVER_PATH = path.join("public", "images", "weekly", "aug-week-1.png");
const OUT_DIR = path.join("public", "weekly-pdfs");

const editions = [
  "aug-week-1-2025.pdf",
  "aug-week-0-2025.pdf",
  "july-week-4-2025.pdf",
  "july-week-3-2025.pdf",
  "july-week-2-2025.pdf",
  "july-week-1-2025.pdf",
];

async function createEditionPdf(filename) {
  const coverBytes = fs.readFileSync(COVER_PATH);
  const pdfDoc = await PDFDocument.create();

  const isJpeg = coverBytes[0] === 0xff && coverBytes[1] === 0xd8;
  const coverImage = isJpeg ? await pdfDoc.embedJpg(coverBytes) : await pdfDoc.embedPng(coverBytes);

  const page = pdfDoc.addPage([coverImage.width, coverImage.height]);
  page.drawImage(coverImage, {
    x: 0,
    y: 0,
    width: coverImage.width,
    height: coverImage.height,
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(OUT_DIR, filename), pdfBytes);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const filename of editions) {
    await createEditionPdf(filename);
    console.log(`Created ${filename}`);
  }
  console.log("Weekly newspaper PDFs ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
