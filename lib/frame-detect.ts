import { PhotoSlot } from "@/types";

interface DetectionResult {
  slots: PhotoSlot[];
  photoCount: number;
  imageWidth: number;
  imageHeight: number;
}

/**
 * Detect transparent rectangular regions in a PNG frame image.
 *
 * Loads the image into an offscreen canvas, reads the alpha channel,
 * flood-fills contiguous transparent areas, computes their bounding
 * boxes, and filters out noise (tiny regions, border artifacts).
 *
 * @param dataUrl base64 data-URL of the uploaded PNG
 * @returns detected photo slots with coordinates in the original image space
 */
export async function detectTransparentRegions(dataUrl: string): Promise<DetectionResult> {
  const img = await loadImageFromUrl(dataUrl);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // Downscale for analysis if image is large (keeps detection super fast and memory-safe)
  const MAX_ANALYSIS_DIM = 800;
  const scale = Math.min(1, MAX_ANALYSIS_DIM / Math.max(origW, origH));
  const w = Math.max(1, Math.round(origW * scale));
  const h = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data; // RGBA flat array

  // Build a binary mask: true = transparent (alpha below threshold)
  const ALPHA_THRESHOLD = 30;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const alpha = pixels[i * 4 + 3];
    mask[i] = alpha < ALPHA_THRESHOLD ? 1 : 0;
  }

  // Flood-fill to find connected transparent regions
  const visited = new Uint8Array(w * h);
  const rawRegions: { minX: number; minY: number; maxX: number; maxY: number; area: number }[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (mask[idx] === 1 && visited[idx] === 0) {
        const region = floodFill(mask, visited, w, h, x, y);
        if (region) {
          rawRegions.push(region);
        }
      }
    }
  }

  // Filter out small noise regions (must be at least 1% of image area)
  const minArea = w * h * 0.005;
  // Minimum dimension: at least 3% of image width/height
  const minDim = Math.min(w, h) * 0.03;

  let significant = rawRegions.filter((r) => {
    const rw = r.maxX - r.minX;
    const rh = r.maxY - r.minY;
    return r.area >= minArea && rw >= minDim && rh >= minDim;
  });

  // Merge overlapping or nearly overlapping regions
  significant = mergeOverlapping(significant, w, h);

  // Trim edge-touching transparent areas that span nearly the full width or height
  // (these are likely the PNG's outer transparency, not photo holes)
  significant = significant.filter((r) => {
    const rw = r.maxX - r.minX;
    const rh = r.maxY - r.minY;
    const isFullWidth = rw > w * 0.95;
    const isFullHeight = rh > h * 0.95;
    return !isFullWidth && !isFullHeight;
  });

  // Sort: top to bottom, then left to right
  significant.sort((a, b) => {
    const ayCentre = (a.minY + a.maxY) / 2;
    const byCentre = (b.minY + b.maxY) / 2;
    const rowTolerance = Math.min(a.maxY - a.minY, b.maxY - b.minY) * 0.3;
    if (Math.abs(ayCentre - byCentre) < rowTolerance) {
      return a.minX - b.minX;
    }
    return ayCentre - byCentre;
  });

  const slots: PhotoSlot[] = significant.map((r) => ({
    x: Math.round(r.minX / scale),
    y: Math.round(r.minY / scale),
    width: Math.round((r.maxX - r.minX) / scale),
    height: Math.round((r.maxY - r.minY) / scale),
  }));

  return {
    slots,
    photoCount: slots.length,
    imageWidth: origW,
    imageHeight: origH,
  };
}

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function floodFill(
  mask: Uint8Array,
  visited: Uint8Array,
  w: number,
  h: number,
  startX: number,
  startY: number,
): { minX: number; minY: number; maxX: number; maxY: number; area: number } | null {
  let minX = startX;
  let maxX = startX;
  let minY = startY;
  let maxY = startY;
  let area = 0;

  // Iterative BFS to avoid call-stack overflow on large images
  const queue: number[] = [startY * w + startX];
  visited[startY * w + startX] = 1;

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const cx = idx % w;
    const cy = (idx - cx) / w;

    area++;
    if (cx < minX) minX = cx;
    if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;

    // 4-connected neighbours
    const neighbours = [
      cy > 0 ? idx - w : -1,
      cy < h - 1 ? idx + w : -1,
      cx > 0 ? idx - 1 : -1,
      cx < w - 1 ? idx + 1 : -1,
    ];

    for (const ni of neighbours) {
      if (ni >= 0 && mask[ni] === 1 && visited[ni] === 0) {
        visited[ni] = 1;
        queue.push(ni);
      }
    }
  }

  return { minX, minY, maxX: maxX + 1, maxY: maxY + 1, area };
}

function mergeOverlapping(
  regions: { minX: number; minY: number; maxX: number; maxY: number; area: number }[],
  _imgW: number,
  _imgH: number,
): typeof regions {
  if (regions.length <= 1) return regions;

  let merged = true;
  let result = [...regions];

  while (merged) {
    merged = false;
    const next: typeof regions = [];
    const used = new Set<number>();

    for (let i = 0; i < result.length; i++) {
      if (used.has(i)) continue;

      let current = { ...result[i] };

      for (let j = i + 1; j < result.length; j++) {
        if (used.has(j)) continue;
        const other = result[j];

        // Check if they overlap or are very close (within 5px gap)
        const gap = 5;
        const overlapX = current.minX - gap < other.maxX && current.maxX + gap > other.minX;
        const overlapY = current.minY - gap < other.maxY && current.maxY + gap > other.minY;

        if (overlapX && overlapY) {
          current = {
            minX: Math.min(current.minX, other.minX),
            minY: Math.min(current.minY, other.minY),
            maxX: Math.max(current.maxX, other.maxX),
            maxY: Math.max(current.maxY, other.maxY),
            area: current.area + other.area,
          };
          used.add(j);
          merged = true;
        }
      }

      next.push(current);
    }

    result = next;
  }

  return result;
}
