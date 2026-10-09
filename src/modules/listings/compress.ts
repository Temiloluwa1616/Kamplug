/**
 * Client-side image compression.
 *
 * Resizes the long edge to MAX_EDGE, re-encodes as JPEG.
 * Typical result: 3-5MB phone photo becomes 200-400KB.
 * Runs in the browser — no upload cost, no server work.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // Non-image or already-tiny files pass through untouched.
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 200 * 1024) return file;

  const bitmap = await loadImage(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
  if (!blob) return file;

  // Give the file a proper name so R2 keys and downloads look sane.
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}