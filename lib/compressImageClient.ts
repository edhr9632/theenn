/** Client-side image compression so admin posts stay under host body limits (Vercel ~4.5 MB). */

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_TARGET_BYTES = 850_000;

export type CompressImageOptions = {
  maxEdge?: number;
  /** Target binary size before base64 encoding. */
  targetBytes?: number;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Could not compress image."))),
      "image/jpeg",
      quality,
    );
  });
}

async function drawToCanvas(source: ImageBitmap | HTMLImageElement, maxEdge: number) {
  const srcW = "width" in source ? source.width : 0;
  const srcH = "height" in source ? source.height : 0;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH, 1));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function compressBitmap(
  bitmap: ImageBitmap,
  options: CompressImageOptions = {},
): Promise<Blob> {
  const targetBytes = options.targetBytes ?? DEFAULT_TARGET_BYTES;
  let maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  let blob: Blob | null = null;

  for (const edge of [maxEdge, 1280, 1024, 800]) {
    maxEdge = edge;
    const canvas = await drawToCanvas(bitmap, maxEdge);
    for (const quality of [0.86, 0.78, 0.7, 0.6, 0.5]) {
      blob = await canvasToBlob(canvas, quality);
      if (blob.size <= targetBytes) {
        bitmap.close();
        return blob;
      }
    }
  }

  bitmap.close();
  if (!blob) throw new Error("Could not compress image.");
  return blob;
}

export async function compressImageToJpegFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const blob = await compressBitmap(bitmap, options);
  const base = file.name.replace(/\.[^.]+$/, "") || "article-image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function fileToCompressedDataUrl(
  file: File,
  options: CompressImageOptions = {},
): Promise<string> {
  const jpeg = await compressImageToJpegFile(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read compressed image."));
    reader.readAsDataURL(jpeg);
  });
}

export async function dataUrlToFile(dataUrl: string, fileName = "image.jpg"): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || "image/jpeg";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${ext}`, { type });
}

export async function compressDataUrl(
  dataUrl: string,
  options: CompressImageOptions = {},
): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) return dataUrl;
  // Already small enough for a safe POST payload
  if (dataUrl.length < 400_000) return dataUrl;
  const file = await dataUrlToFile(dataUrl);
  return fileToCompressedDataUrl(file, options);
}

export function isDataImageUrl(value: string) {
  return value.trim().startsWith("data:image/");
}
