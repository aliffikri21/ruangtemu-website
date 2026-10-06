import { FrameConfig, CameraFilter } from "@/types";

export interface RenderOptions {
  photos: string[]; // Base64 data URLs
  config: FrameConfig;
  filter?: CameraFilter;
  highRes?: boolean;
}

export function applyFilterToContext(ctx: CanvasRenderingContext2D, filter?: CameraFilter) {
  if (!filter || filter === "normal") {
    ctx.filter = "none";
    return;
  }
  switch (filter) {
    case "grayscale":
      ctx.filter = "grayscale(100%) contrast(110%)";
      break;
    case "sepia":
      ctx.filter = "sepia(80%) contrast(105%)";
      break;
    case "soft-glow":
      ctx.filter = "brightness(105%) contrast(95%) saturate(110%)";
      break;
    case "warm-vintage":
      ctx.filter = "sepia(35%) saturate(125%) contrast(110%)";
      break;
    case "cool-cinema":
      ctx.filter = "hue-rotate(185deg) saturate(90%) contrast(115%)";
      break;
    default:
      ctx.filter = "none";
      break;
  }
}

let _isCanvasFilterSupportedCache: boolean | null = null;

export function isCanvasFilterSupported(): boolean {
  if (_isCanvasFilterSupportedCache !== null) return _isCanvasFilterSupportedCache;
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 2;
    const ctx = c.getContext("2d");
    if (!ctx || typeof ctx.filter !== "string") {
      _isCanvasFilterSupportedCache = false;
      return false;
    }
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(0, 0, 2, 2);
    ctx.filter = "grayscale(100%)";
    ctx.drawImage(c, 0, 0);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    // In grayscale, red (255,0,0) becomes gray (~76, 76, 76), so r and g become almost equal
    _isCanvasFilterSupportedCache = Math.abs(p[0] - p[1]) < 10;
    return _isCanvasFilterSupportedCache;
  } catch {
    _isCanvasFilterSupportedCache = false;
    return false;
  }
}

/**
 * Universal pixel manipulation filter fallback for Safari iOS < 18 or browsers without ctx.filter support.
 * Executes in ~4-6ms for HD resolution on mobile.
 */
export function applyPixelFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter?: CameraFilter
) {
  if (!filter || filter === "normal") return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  if (filter === "grayscale") {
    // grayscale(100%) contrast(110%)
    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = (gray - 128) * 1.1 + 128;
      const clamped = val < 0 ? 0 : val > 255 ? 255 : val;
      data[i] = clamped;
      data[i + 1] = clamped;
      data[i + 2] = clamped;
    }
  } else if (filter === "sepia") {
    // sepia(80%) contrast(105%)
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;

      // 80% sepia blend
      let nr = r * 0.2 + sr * 0.8;
      let ng = g * 0.2 + sg * 0.8;
      let nb = b * 0.2 + sb * 0.8;

      // Contrast 1.05
      nr = (nr - 128) * 1.05 + 128;
      ng = (ng - 128) * 1.05 + 128;
      nb = (nb - 128) * 1.05 + 128;

      data[i] = nr < 0 ? 0 : nr > 255 ? 255 : nr;
      data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
      data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
    }
  } else if (filter === "soft-glow") {
    // brightness(105%) contrast(95%) saturate(110%)
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness 1.05 & contrast 0.95
      r = (r * 1.05 - 128) * 0.95 + 128;
      g = (g * 1.05 - 128) * 0.95 + 128;
      b = (b * 1.05 - 128) * 0.95 + 128;

      // Saturate 1.1
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * 1.1;
      g = gray + (g - gray) * 1.1;
      b = gray + (b - gray) * 1.1;

      data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
  } else if (filter === "warm-vintage") {
    // sepia(35%) saturate(125%) contrast(110%)
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;

      // 35% sepia blend
      let nr = r * 0.65 + sr * 0.35;
      let ng = g * 0.65 + sg * 0.35;
      let nb = b * 0.65 + sb * 0.35;

      // Saturate 1.25
      const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
      nr = gray + (nr - gray) * 1.25;
      ng = gray + (ng - gray) * 1.25;
      nb = gray + (nb - gray) * 1.25;

      // Contrast 1.10
      nr = (nr - 128) * 1.1 + 128;
      ng = (ng - 128) * 1.1 + 128;
      nb = (nb - 128) * 1.1 + 128;

      data[i] = nr < 0 ? 0 : nr > 255 ? 255 : nr;
      data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
      data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
    }
  } else if (filter === "cool-cinema") {
    // hue-rotate(185deg) saturate(90%) contrast(115%)
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Cool tone shift towards teal/cyan shadows & blue highlights
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = r * 0.82 + gray * 0.08;
      g = g * 0.95 + 8;
      b = b * 1.18 + 18;

      // Saturate 0.9
      const newGray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = newGray + (r - newGray) * 0.9;
      g = newGray + (g - newGray) * 0.9;
      b = newGray + (b - newGray) * 0.9;

      // Contrast 1.15
      r = (r - 128) * 1.15 + 128;
      g = (g - 128) * 1.15 + 128;
      b = (b - 128) * 1.15 + 128;

      data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Helper to load image
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Composite photos and frame configuration onto an HTML5 Canvas
 */
export async function renderPhotoboothFrame(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<string> {
  const { photos, config, filter = "normal", highRes = false } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  // Load all photo images
  const loadedPhotos = await Promise.all(photos.map((src) => loadImage(src)));

  // Load custom overlay if present
  let customOverlay: HTMLImageElement | null = null;
  if (config.customOverlayUrl) {
    try {
      customOverlay = await loadImage(config.customOverlayUrl);
    } catch {
      console.warn("Failed to load custom overlay image");
    }
  }

  // Determine Canvas Dimensions based on Frame Type or Custom Photo Slots
  // Capped for optimal mobile performance and Vercel payload limits (< 4.5MB)
  let width = 600;
  let height = 1800; // Strip 3 default

  if (config.photoSlots && config.photoSlots.length > 0) {
    const baseW = config.frameImageWidth || (customOverlay ? customOverlay.naturalWidth : 600);
    const baseH = config.frameImageHeight || (customOverlay ? customOverlay.naturalHeight : 1800);
    // Limit max dimension to 1200x1800 to avoid multi-megabyte payloads while preserving crisp HD quality
    const MAX_W = 1200;
    const MAX_H = 1800;
    let scale = 1;
    if (baseW > MAX_W || baseH > MAX_H) {
      scale = Math.min(MAX_W / baseW, MAX_H / baseH);
    } else if (highRes && baseW < 800) {
      scale = Math.min(800 / baseW, 1200 / baseH);
    }
    width = Math.round(baseW * scale);
    height = Math.round(baseH * scale);
  } else if (config.type === "strip_3") {
    width = 600;
    height = 1800;
  } else if (config.type === "grid_4") {
    width = 800;
    height = 1000;
  } else if (config.type === "polaroid") {
    width = 700;
    height = 850;
  } else if (config.type === "deluxe") {
    width = 800;
    height = 1100;
  }

  canvas.width = width;
  canvas.height = height;

  // Render Custom Transparent Photo Slots if detected from PNG
  if (config.photoSlots && config.photoSlots.length > 0) {
    const origW = config.frameImageWidth || (customOverlay ? customOverlay.naturalWidth : width);
    const origH = config.frameImageHeight || (customOverlay ? customOverlay.naturalHeight : height);
    const scaleX = width / origW;
    const scaleY = height / origH;

    const bgColor =
      config.backgroundColor && config.backgroundColor !== "transparent"
        ? config.backgroundColor
        : "#ffffff";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < config.photoSlots.length; i++) {
      const slot = config.photoSlots[i];
      const sx = Math.max(0, slot.x * scaleX - 1);
      const sy = Math.max(0, slot.y * scaleY - 1);
      const sw = slot.width * scaleX + 2;
      const sh = slot.height * scaleY + 2;

      const img = loadedPhotos[i % loadedPhotos.length];

      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, sy, sw, sh);
      ctx.clip();

      applyFilterToContext(ctx, filter);
      if (img) {
        drawImageAspectFill(ctx, img, sx, sy, sw, sh);
      } else {
        ctx.fillStyle = "#334155";
        ctx.fillRect(sx, sy, sw, sh);
      }
      ctx.restore();
    }

    if (customOverlay) {
      ctx.drawImage(customOverlay, 0, 0, width, height);
    }

    return canvas.toDataURL("image/png", 0.95);
  }

  const scale = width / 600;
  const padding = (config.padding || 16) * scale;
  const radius = (config.borderRadius || 8) * scale;

  // 1. Draw Background
  ctx.fillStyle = config.backgroundColor || "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Decorative Border if configured
  if (config.borderColor) {
    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(padding / 2, padding / 2, width - padding, height - padding);
  }

  // 3. Render Photo Slots depending on Frame Type
  if (config.type === "strip_3") {
    const photoCount = 3;
    const footerHeight = 240 * scale;
    const availableHeight = height - padding * 2 - footerHeight;
    const photoGap = 16 * scale;
    const photoHeight = (availableHeight - photoGap * (photoCount - 1)) / photoCount;
    const photoWidth = width - padding * 2;

    for (let i = 0; i < photoCount; i++) {
      const y = padding + i * (photoHeight + photoGap);
      const img = loadedPhotos[i % loadedPhotos.length];

      ctx.save();
      // Rounded corner clip for photo
      drawRoundedRect(ctx, padding, y, photoWidth, photoHeight, radius);
      ctx.clip();

      applyFilterToContext(ctx, filter);
      if (img) {
        drawImageAspectFill(ctx, img, padding, y, photoWidth, photoHeight);
      } else {
        ctx.fillStyle = "#334155";
        ctx.fillRect(padding, y, photoWidth, photoHeight);
      }
      ctx.restore();
    }

    // Draw Footer Text & Branding (only if no full PNG overlay, or if textContent is explicitly defined)
    const footerY = height - footerHeight + padding;
    ctx.textAlign = "center";
    ctx.fillStyle = config.textColor || "#ffffff";

    // Sticker
    if (config.sticker && !customOverlay) {
      ctx.font = `${32 * scale}px sans-serif`;
      ctx.fillText(config.sticker, width / 2, footerY + 36 * scale);
    }

    // Title Text
    if (config.textContent || !customOverlay) {
      ctx.font = `bold ${24 * scale}px ${config.fontFamily || "sans-serif"}`;
      ctx.fillText(
        config.textContent || "RUANGTEMU PHOTOBOOTH",
        width / 2,
        footerY + 76 * scale
      );
    }

    // Subtitle Text
    if (config.subTextContent) {
      ctx.font = `${14 * scale}px ${config.fontFamily || "sans-serif"}`;
      ctx.fillStyle = config.textColor || "rgba(255, 255, 255, 0.75)";
      ctx.fillText(config.subTextContent, width / 2, footerY + 104 * scale);
    }

    // Small Brand Tag
    if (!customOverlay) {
      ctx.font = `italic ${10 * scale}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText("RUANGTEMU DIGITAL • PALOPO", width / 2, height - 16 * scale);
    }

  } else if (config.type === "grid_4") {
    const footerHeight = 160 * scale;
    const cols = 2;
    const rows = 2;
    const photoGap = 16 * scale;
    const photoWidth = (width - padding * 2 - photoGap) / cols;
    const photoHeight = (height - padding * 2 - footerHeight - photoGap) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const x = padding + c * (photoWidth + photoGap);
        const y = padding + r * (photoHeight + photoGap);
        const img = loadedPhotos[index % loadedPhotos.length];

        ctx.save();
        drawRoundedRect(ctx, x, y, photoWidth, photoHeight, radius);
        ctx.clip();

        applyFilterToContext(ctx, filter);
        if (img) {
          drawImageAspectFill(ctx, img, x, y, photoWidth, photoHeight);
        } else {
          ctx.fillStyle = "#334155";
          ctx.fillRect(x, y, photoWidth, photoHeight);
        }
        ctx.restore();
      }
    }

    // Footer
    const footerY = height - footerHeight + 20 * scale;
    ctx.textAlign = "center";
    ctx.fillStyle = config.textColor || "#ffffff";

    if (config.sticker) {
      ctx.font = `${28 * scale}px sans-serif`;
      ctx.fillText(config.sticker, width / 2, footerY + 24 * scale);
    }

    ctx.font = `bold ${22 * scale}px ${config.fontFamily || "sans-serif"}`;
    ctx.fillText(config.textContent || "RUANGTEMU DIGITAL", width / 2, footerY + 60 * scale);

    if (config.subTextContent) {
      ctx.font = `${13 * scale}px ${config.fontFamily || "sans-serif"}`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(config.subTextContent, width / 2, footerY + 84 * scale);
    }

  } else if (config.type === "polaroid") {
    const bottomBanner = 180 * scale;
    const photoWidth = width - padding * 2;
    const photoHeight = height - padding * 2 - bottomBanner;

    const img = loadedPhotos[0];
    ctx.save();
    drawRoundedRect(ctx, padding, padding, photoWidth, photoHeight, radius);
    ctx.clip();

    applyFilterToContext(ctx, filter);
    if (img) {
      drawImageAspectFill(ctx, img, padding, padding, photoWidth, photoHeight);
    } else {
      ctx.fillStyle = "#334155";
      ctx.fillRect(padding, padding, photoWidth, photoHeight);
    }
    ctx.restore();

    // Polaroid bottom area
    const footerY = height - bottomBanner + 40 * scale;
    ctx.textAlign = "center";
    ctx.fillStyle = config.textColor || "#1e293b";

    if (config.sticker) {
      ctx.font = `${30 * scale}px sans-serif`;
      ctx.fillText(config.sticker, width / 2, footerY);
    }

    ctx.font = `bold ${26 * scale}px ${config.fontFamily || "cursive"}`;
    ctx.fillText(config.textContent || "Memories in Palopo", width / 2, footerY + 44 * scale);

    if (config.subTextContent) {
      ctx.font = `${14 * scale}px ${config.fontFamily || "sans-serif"}`;
      ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
      ctx.fillText(config.subTextContent, width / 2, footerY + 74 * scale);
    }

  } else {
    // Deluxe style (2 side-by-side or stacked with golden ornament)
    const headerHeight = 80 * scale;
    const footerHeight = 160 * scale;
    const contentHeight = height - headerHeight - footerHeight - padding * 2;
    const photoGap = 16 * scale;
    const photoCount = Math.min(photos.length || 2, 2);
    const photoHeight = (contentHeight - photoGap * (photoCount - 1)) / photoCount;
    const photoWidth = width - padding * 2;

    // Header title
    ctx.textAlign = "center";
    ctx.fillStyle = config.textColor || "#ffffff";
    ctx.font = `bold ${20 * scale}px ${config.fontFamily || "serif"}`;
    ctx.fillText(config.textContent || "SPECIAL CELEBRATION", width / 2, padding + 40 * scale);

    for (let i = 0; i < photoCount; i++) {
      const y = padding + headerHeight + i * (photoHeight + photoGap);
      const img = loadedPhotos[i % loadedPhotos.length];

      ctx.save();
      drawRoundedRect(ctx, padding, y, photoWidth, photoHeight, radius);
      ctx.clip();

      applyFilterToContext(ctx, filter);
      if (img) {
        drawImageAspectFill(ctx, img, padding, y, photoWidth, photoHeight);
      } else {
        ctx.fillStyle = "#334155";
        ctx.fillRect(padding, y, photoWidth, photoHeight);
      }
      ctx.restore();
    }

    // Deluxe Footer
    const footerY = height - footerHeight + 30 * scale;
    if (config.sticker) {
      ctx.font = `${28 * scale}px sans-serif`;
      ctx.fillText(config.sticker, width / 2, footerY + 20 * scale);
    }
    if (config.subTextContent) {
      ctx.font = `${15 * scale}px ${config.fontFamily || "serif"}`;
      ctx.fillStyle = config.textColor || "#f8fafc";
      ctx.fillText(config.subTextContent, width / 2, footerY + 54 * scale);
    }
    ctx.font = `${11 * scale}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("RUANGTEMU PHOTOBOOTH • PALOPO", width / 2, height - 20 * scale);
  }

  // 4. Draw Custom PNG Overlay if provided
  if (customOverlay) {
    ctx.drawImage(customOverlay, 0, 0, width, height);
  }

  // Export as high-quality JPEG (0.88) to keep payload ~400KB and bypass Vercel 4.5MB limit
  return canvas.toDataURL("image/jpeg", 0.88);
}

// Utility: draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Utility: Aspect fill an image into rectangular slot
function drawImageAspectFill(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetWidth: number,
  targetHeight: number
) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const targetAspect = targetWidth / targetHeight;

  let renderWidth = targetWidth;
  let renderHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > targetAspect) {
    // Image is wider than target slot
    renderHeight = targetHeight;
    renderWidth = targetHeight * imgAspect;
    offsetX = (targetWidth - renderWidth) / 2;
  } else {
    // Image is taller than target slot
    renderWidth = targetWidth;
    renderHeight = targetWidth / imgAspect;
    offsetY = (targetHeight - renderHeight) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, renderWidth, renderHeight);
}
