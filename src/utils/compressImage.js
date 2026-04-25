/**
 * compressImage.js
 * Pure browser Canvas compression — no dependencies.
 *
 * Strategy:
 *  1. Load the file/dataUrl into an Image element
 *  2. Draw it onto a canvas at reduced dimensions (if needed)
 *  3. Export as JPEG at the target quality
 *  4. If the result is LARGER than the original, return the original (safety net)
 *
 * Defaults:
 *  - maxWidth / maxHeight : 1600px  (keeps yearbook photos sharp but not huge)
 *  - quality              : 0.82    (very good quality, ~60-75% size reduction)
 *  - maxSizeKB            : 800 KB  (hard ceiling — iterates quality down if needed)
 */

const DEFAULT_MAX_W  = 1600;
const DEFAULT_MAX_H  = 1600;
const DEFAULT_Q      = 0.82;
const DEFAULT_MAX_KB = 800;

/**
 * Compress a File or Blob.
 * Returns a Blob (JPEG).
 */
export async function compressFile(file, opts = {}) {
  const {
    maxWidth  = DEFAULT_MAX_W,
    maxHeight = DEFAULT_MAX_H,
    quality   = DEFAULT_Q,
    maxSizeKB = DEFAULT_MAX_KB,
  } = opts;

  const dataUrl = await fileToDataUrl(file);
  return compressDataUrl(dataUrl, { maxWidth, maxHeight, quality, maxSizeKB });
}

/**
 * Compress a base64 data URL.
 * Returns a Blob (JPEG).
 */
export async function compressDataUrl(dataUrl, opts = {}) {
  const {
    maxWidth  = DEFAULT_MAX_W,
    maxHeight = DEFAULT_MAX_H,
    quality   = DEFAULT_Q,
    maxSizeKB = DEFAULT_MAX_KB,
  } = opts;

  const img = await loadImage(dataUrl);

  /* ── Scale dimensions ── */
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width  = Math.round(width  * ratio);
    height = Math.round(height * ratio);
  }

  /* ── Draw onto canvas ── */
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  /* Smooth scaling */
  ctx.imageSmoothingEnabled  = true;
  ctx.imageSmoothingQuality  = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  /* ── Compress, iterate quality down if still too big ── */
  let q    = quality;
  let blob = await canvasToBlob(canvas, 'image/jpeg', q);

  while (blob.size > maxSizeKB * 1024 && q > 0.35) {
    q   -= 0.07;
    blob = await canvasToBlob(canvas, 'image/jpeg', Math.max(q, 0.35));
  }

  /* Safety net: if compressed blob is bigger than original, return original */
  const originalSize = dataUrl.length * 0.75; // rough byte estimate from base64
  if (blob.size > originalSize && originalSize > 0) {
    const origBlob = await (await fetch(dataUrl)).blob();
    return origBlob;
  }

  return blob;
}

/**
 * Compress + return as a data URL string (useful for previews).
 */
export async function compressToDataUrl(file, opts = {}) {
  const blob = await compressFile(file, opts);
  return blobToDataUrl(blob);
}

/* ── Helpers ────────────────────────────────────────────── */

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      type,
      quality,
    );
  });
}

/**
 * Human-readable file size string.
 * e.g. formatBytes(1234567) → "1.18 MB"
 */
export function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
