import { FrameConfig, CameraFilter } from "@/types";

export interface RenderOptions {
  photos: string[]; // Base64 data URLs
  config: FrameConfig;
  filter?: CameraFilter;
  highRes?: boolean;
}

export function applyFilterToContext(ctx: CanvasRenderingContext2D, filter?: CameraFilter) {
  switch (filter) {
    case "grayscale":
      ctx.filter = "grayscale(100%) contrast(110%)";
      break;
    case "sepia":
      ctx.filter = "sepia(80%) contrast(105%) brightness(95%)";
      break;
    case "soft-glow":
      ctx.filter = "brightness(105%) contrast(95%) saturate(110%) blur(0.3px)";
      break;
    case "warm-vintage":
      ctx.filter = "sepia(35%) saturate(125%) contrast(110%) brightness(102%)";
      break;
    case "cool-cinema":
      ctx.filter = "hue-rotate(185deg) saturate(90%) contrast(115%)";
      break;
    case "normal":
    default:
      ctx.filter = "none";
      break;
  }
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

  // Determine Canvas Dimensions based on Frame Type
  let width = 600;
  let height = 1800; // Strip 3 default

  if (config.type === "strip_3") {
    width = highRes ? 1200 : 600;
    height = highRes ? 3600 : 1800;
  } else if (config.type === "grid_4") {
    width = highRes ? 1600 : 800;
    height = highRes ? 2000 : 1000;
  } else if (config.type === "polaroid") {
    width = highRes ? 1400 : 700;
    height = highRes ? 1700 : 850;
  } else if (config.type === "deluxe") {
    width = highRes ? 1600 : 800;
    height = highRes ? 2200 : 1100;
  }

  canvas.width = width;
  canvas.height = height;

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

  return canvas.toDataURL("image/png", 0.95);
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
