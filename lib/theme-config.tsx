import React from "react";
import { LandingThemeConfig, EventItem } from "@/types";

export const ICONS: Record<string, React.ReactNode> = {
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[55%] h-[55%]">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[55%] h-[55%]">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[55%] h-[55%]">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16l-5-5-8 8" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[55%] h-[55%]">
      <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[55%] h-[55%]">
      <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%]">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  none: null,
};

export const FONTS_BODY = ["Space Grotesk", "Inter", "Poppins", "Montserrat", "Playfair Display"];
export const FONTS_TITLE = ["Great Vibes", "Allura", "Dancing Script", "Playfair Display", "Space Grotesk", "Poppins", "Montserrat"];

export const DEFAULT_THEME_CONFIG: LandingThemeConfig = {
  global: { font: "Space Grotesk" },
  background: { image: "", color: "#8c949e", overlay: 0.12, fade: 0.75, posY: 50 },
  header: { show: true, left: "The Wedding", right: "Memories", color: "#ffffff", size: 15 },
  title: { show: true, text: "Jaya & Rika", font: "Great Vibes", size: 58, color: "#ffffff", top: 18, align: "center" },
  info: { show: true, line1: "12 Oktober 2026", line2: "D'Twins Cafe", color: "#ffffff", size: 13, align: "left", top: 14 },
  cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#ffffff", color: "#111111", iconBg: "#224DA5", iconColor: "#ffffff", href: "/capture" },
  cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "outline", bg: "#ffffff", borderColor: "#ffffff", color: "#ffffff", iconBg: "#ffffff33", iconColor: "#ffffff", href: "/album" },
  footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#ffffff" },
  layout: { variant: "classic", surface: "#ffffff", accent: "#224DA5", photoHeight: 54, buttonStyle: "pill", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
};

export const TEMPLATES: { id: string; name: string; patch: Partial<LandingThemeConfig> }[] = [
  {
    id: "classic",
    name: "Classic",
    patch: {
      global: { font: "Space Grotesk" },
      background: { overlay: 0.12, fade: 0.75, posY: 50, color: "#111111", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#ffffff", size: 15 },
      title: { show: true, text: "", font: "Great Vibes", size: 58, color: "#ffffff", align: "center", top: 18 },
      info: { show: true, line1: "", line2: "", color: "#ffffff", size: 13, align: "left", top: 14 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#ffffff", color: "#111111", iconBg: "#224DA5", iconColor: "#ffffff", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "outline", bg: "#ffffff", borderColor: "#ffffff", color: "#ffffff", iconBg: "#ffffff33", iconColor: "#ffffff", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#ffffff" },
      layout: { variant: "classic", buttonStyle: "pill", surface: "#ffffff", accent: "#224DA5", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
  {
    id: "center",
    name: "Center",
    patch: {
      global: { font: "Montserrat" },
      background: { overlay: 0.32, fade: 0.55, posY: 50, color: "#0f172a", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#ffffff", size: 15 },
      title: { show: true, text: "", font: "Playfair Display", size: 46, color: "#ffffff", align: "center", top: 0 },
      info: { show: true, line1: "", line2: "", color: "#ffffff", size: 13, align: "center", top: 12 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#ffffff", color: "#111111", iconBg: "#111111", iconColor: "#ffffff", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "glass", bg: "#ffffff", borderColor: "#ffffff", color: "#ffffff", iconBg: "#ffffff33", iconColor: "#ffffff", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#ffffff" },
      layout: { variant: "center", buttonStyle: "rounded", surface: "#ffffff", accent: "#ffffff", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
  {
    id: "sheet",
    name: "Sheet",
    patch: {
      global: { font: "Poppins" },
      background: { overlay: 0.05, fade: 0.6, posY: 50, color: "#2b2118", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#ffffff", size: 15 },
      title: { show: true, text: "", font: "Playfair Display", size: 40, color: "#2b2118", align: "left", top: 0 },
      info: { show: true, line1: "", line2: "", color: "#6b5d50", size: 13, align: "left", top: 10 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#2b2118", color: "#ffffff", iconBg: "#ffffff", iconColor: "#2b2118", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "outline", bg: "#ffffff", borderColor: "#2b2118", color: "#2b2118", iconBg: "#2b211822", iconColor: "#2b2118", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#8a7c6e" },
      layout: { variant: "sheet", buttonStyle: "pill", surface: "#fbf7f2", accent: "#2b2118", photoHeight: 54, buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
  {
    id: "polaroid",
    name: "Polaroid",
    patch: {
      global: { font: "Poppins" },
      background: { overlay: 0, fade: 0, posY: 50, color: "#f3ece4", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#5a4636", size: 15 },
      title: { show: true, text: "", font: "Dancing Script", size: 44, color: "#5a4636", align: "center", top: 8 },
      info: { show: true, line1: "", line2: "", color: "#7d6857", size: 13, align: "center", top: 8 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#5a4636", color: "#ffffff", iconBg: "#f3ece4", iconColor: "#5a4636", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "outline", bg: "#ffffff", borderColor: "#5a4636", color: "#5a4636", iconBg: "#5a463622", iconColor: "#5a4636", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#8c7866" },
      layout: { variant: "polaroid", buttonStyle: "rounded", surface: "#f3ece4", accent: "#5a4636", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
  {
    id: "arch",
    name: "Arch",
    patch: {
      global: { font: "Montserrat" },
      background: { overlay: 0, fade: 0, posY: 50, color: "#f6efe9", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#6b4f3f", size: 15 },
      title: { show: true, text: "", font: "Great Vibes", size: 52, color: "#6b4f3f", align: "center", top: 14 },
      info: { show: true, line1: "", line2: "", color: "#8a6f5f", size: 13, align: "center", top: 8 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#6b4f3f", color: "#ffffff", iconBg: "#f6efe9", iconColor: "#6b4f3f", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "outline", bg: "#ffffff", borderColor: "#6b4f3f", color: "#6b4f3f", iconBg: "#6b4f3f22", iconColor: "#6b4f3f", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#9a8070" },
      layout: { variant: "arch", buttonStyle: "pill", surface: "#f6efe9", accent: "#b98a6b", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
  {
    id: "editorial",
    name: "Editorial",
    patch: {
      global: { font: "Inter" },
      background: { overlay: 0.25, fade: 0.9, posY: 50, color: "#1a1714", image: "" },
      header: { show: true, left: "The Wedding", right: "Memories", color: "#ffffff", size: 15 },
      title: { show: true, text: "", font: "Playfair Display", size: 50, color: "#ffffff", align: "left", top: 0 },
      info: { show: true, line1: "", line2: "", color: "#e8e0d4", size: 13, align: "left", top: 12 },
      cta1: { show: true, text: "Tambahkan Momen Anda", icon: "arrow", bg: "#e8c97a", color: "#1a1714", iconBg: "#1a1714", iconColor: "#e8c97a", href: "/capture" },
      cta2: { show: true, text: "Jelajahi Album", icon: "image", variant: "glass", bg: "#ffffff", borderColor: "#ffffff", color: "#ffffff", iconBg: "#ffffff33", iconColor: "#ffffff", href: "/album" },
      footer: { show: true, text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH", color: "#ffffff" },
      layout: { variant: "editorial", buttonStyle: "square", surface: "#ffffff", accent: "#e8c97a", buttonHeight: 56, buttonFont: 16, gap: 12, sidePadding: 24, topPadding: 28, bottomPadding: 22, footerGap: 14 },
    },
  },
];

export function mergeThemeConfig(
  base: LandingThemeConfig,
  patch: Partial<LandingThemeConfig>
): LandingThemeConfig {
  const result: any = structuredClone(base);
  for (const key of Object.keys(patch)) {
    const patchVal = (patch as any)[key];
    if (patchVal && typeof patchVal === "object" && !Array.isArray(patchVal)) {
      result[key] = { ...(result[key] || {}), ...patchVal };
    } else if (patchVal !== undefined && patchVal !== "") {
      result[key] = patchVal;
    }
  }
  return result;
}

export function getDefaultThemeConfigForEvent(event?: Partial<EventItem>): LandingThemeConfig {
  const isJayaRika =
    event?.slug === "jayarika-wedding" ||
    event?.slug?.toLowerCase().includes("jayarika") ||
    event?.title?.toLowerCase().includes("jaya");

  const isIlvaRicky =
    event?.slug === "ilvaricky-wedding" ||
    event?.slug?.toLowerCase().includes("ilva") ||
    event?.title?.toLowerCase().includes("ilva");

  const coupleName = isJayaRika
    ? "Jaya & Rika"
    : isIlvaRicky
      ? "Ilva & Ricky"
      : (event?.host_name || event?.title || "Jaya & Rika");

  const dateText = isJayaRika
    ? "12 Oktober 2026"
    : isIlvaRicky
      ? "08 Oktober 2026"
      : (event?.date || "12 Oktober 2026");

  const venueText = isJayaRika
    ? "D'Twins Cafe"
    : isIlvaRicky
      ? "Gedung Opu Daeng Risadju"
      : (event?.venue || "D'Twins Cafe");

  const bgImage = isJayaRika
    ? "/images/events/bg-jayarika.png"
    : isIlvaRicky
      ? "/images/events/ilvaricky-bg.jpeg"
      : (event?.cover_image_url || event?.cover_image || "/images/events/bg-jayarika.png");

  const accentColor = isJayaRika ? "#224DA5" : isIlvaRicky ? "#3a716c" : "#224DA5";

  return {
    global: { font: "Space Grotesk" },
    background: {
      image: bgImage,
      color: "#050505",
      overlay: 0.12,
      fade: 0.75,
      posY: 50,
    },
    header: {
      show: true,
      left: "The Wedding",
      right: "Memories",
      color: "#ffffff",
      size: 15,
    },
    title: {
      show: true,
      text: coupleName,
      font: "Great Vibes",
      size: 58,
      color: "#ffffff",
      top: 18,
      align: "center",
    },
    info: {
      show: true,
      line1: dateText,
      line2: venueText,
      color: "#ffffff",
      size: 13,
      align: "left",
      top: 14,
    },
    cta1: {
      show: true,
      text: "Tambahkan Momen Anda",
      icon: "arrow",
      bg: "#ffffff",
      color: "#111111",
      iconBg: accentColor,
      iconColor: "#ffffff",
      href: "/capture",
    },
    cta2: {
      show: true,
      text: "Jelajahi Album",
      icon: "image",
      variant: "outline",
      bg: "#ffffff",
      borderColor: "#ffffff",
      color: "#ffffff",
      iconBg: "#ffffff33",
      iconColor: "#ffffff",
      href: event?.slug ? `/event/${event.slug}/gallery` : "/album",
    },
    footer: {
      show: true,
      text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH",
      color: "#ffffff",
    },
    layout: {
      variant: "classic",
      surface: "#ffffff",
      accent: accentColor,
      photoHeight: 54,
      buttonStyle: "pill",
      buttonHeight: 56,
      buttonFont: 16,
      gap: 12,
      sidePadding: 24,
      topPadding: 28,
      bottomPadding: 22,
      footerGap: 14,
    },
  };
}

const BUTTON_RADIUS_MAP: Record<string, string> = {
  pill: "999px",
  rounded: "20px",
  square: "8px",
};

interface LandingPageViewProps {
  config: LandingThemeConfig;
  onSectionClick?: (sectionId: string) => void;
  onCta1Click?: () => void;
  onCta2Click?: () => void;
  interactive?: boolean;
}

export function LandingPageView({
  config: c,
  onSectionClick,
  onCta1Click,
  onCta2Click,
  interactive = true,
}: LandingPageViewProps) {
  const g = c.global || DEFAULT_THEME_CONFIG.global;
  const L = c.layout || DEFAULT_THEME_CONFIG.layout;
  const bg = c.background || DEFAULT_THEME_CONFIG.background;
  const V = L.variant || "classic";
  const surface = L.surface || "#ffffff";
  const accent = L.accent || "#224DA5";
  const side = L.sidePadding ?? 24;
  const radius = BUTTON_RADIUS_MAP[L.buttonStyle] || "999px";
  const icoRadius = L.buttonStyle === "square" ? "10px" : "50%";
  const icoSize = Math.round((L.buttonHeight || 56) * 0.72);
  const pad = Math.max(4, Math.round(((L.buttonHeight || 56) - icoSize) / 2));

  const bgImg = bg.image ? `url("${bg.image}")` : "none";

  const handleSec = (e: React.MouseEvent, secId: string) => {
    if (!interactive) return;
    if (onSectionClick) {
      e.preventDefault();
      e.stopPropagation();
      onSectionClick(secId);
    }
  };

  /* Header Piece */
  const renderHeader = (withBorder = false) => {
    if (!c.header?.show) return <div style={{ height: `${L.topPadding}px` }} />;
    return (
      <div
        data-sec="header"
        onClick={(e) => handleSec(e, "header")}
        className={interactive ? "cursor-pointer transition-opacity hover:opacity-85 select-none" : "select-none"}
        style={{ padding: `${L.topPadding}px ${side}px 0` }}
      >
        <div
          className="flex justify-between items-center font-medium"
          style={{
            color: c.header.color,
            fontSize: `${c.header.size}px`,
            paddingBottom: withBorder ? "12px" : undefined,
            borderBottom: withBorder ? `1px solid ${c.header.color}66` : undefined,
          }}
        >
          <span>{c.header.left}</span>
          <span>{c.header.right}</span>
        </div>
      </div>
    );
  };

  /* Title Piece */
  const renderTitle = (align: "left" | "center" | "right", top: number, extraStyle: React.CSSProperties = {}) => {
    if (!c.title?.show) return null;
    return (
      <div
        data-sec="title"
        onClick={(e) => handleSec(e, "title")}
        className={interactive ? "cursor-pointer transition-opacity hover:opacity-85 select-none" : "select-none"}
        style={{
          marginTop: `${top}px`,
          padding: `0 ${side}px`,
          textAlign: align,
          fontFamily: `'${c.title.font}', cursive, serif`,
          fontSize: `${c.title.size}px`,
          color: c.title.color,
          lineHeight: 1.1,
          whiteSpace: "pre-line",
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.85))",
          ...extraStyle,
        }}
      >
        {c.title.text}
      </div>
    );
  };

  /* Info Piece */
  const renderInfo = (align: "left" | "center" | "right") => {
    if (!c.info?.show) return null;
    return (
      <div
        data-sec="info"
        onClick={(e) => handleSec(e, "info")}
        className={interactive ? "cursor-pointer transition-opacity hover:opacity-85 select-none" : "select-none"}
        style={{
          marginTop: `${c.info.top}px`,
          padding: `0 ${side}px`,
          textAlign: align,
          color: c.info.color,
          fontSize: `${c.info.size}px`,
          lineHeight: 1.45,
          filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.8))",
        }}
      >
        {c.info.line1 && <div>{c.info.line1}</div>}
        {c.info.line2 && <div>{c.info.line2}</div>}
      </div>
    );
  };

  /* CTA Buttons Piece */
  const b1 = c.cta1;
  const b2 = c.cta2;

  const renderButtons = () => {
    const isClickable = Boolean(interactive || onCta1Click || onCta2Click);
    const Btn1Tag = (onCta1Click || interactive) ? "button" : "div";
    const Btn2Tag = (onCta2Click || interactive) ? "button" : "div";

    return (
      <div
        className="flex flex-col"
        style={{
          gap: `${L.gap}px`,
          padding: `0 ${side}px`,
        }}
      >
        {b1?.show && (
          <Btn1Tag
            {...(Btn1Tag === "button" ? { type: "button" } : {})}
            data-sec="cta1"
            onClick={(e: React.MouseEvent) => {
              if (onCta1Click) {
                e.preventDefault();
                onCta1Click();
              } else {
                handleSec(e, "cta1");
              }
            }}
            className={`flex items-center justify-between font-semibold shadow-lg active:scale-[0.98] transition-transform select-none ${
              isClickable ? "cursor-pointer" : "cursor-default"
            }`}
            style={{
              height: `${L.buttonHeight}px`,
              borderRadius: radius,
              padding: `0 ${pad}px 0 ${Math.round(L.buttonHeight * 0.42)}px`,
              backgroundColor: b1.bg,
              color: b1.color,
              fontSize: `${L.buttonFont}px`,
            }}
          >
            <span className="tracking-tight">{b1.text}</span>
            {b1.icon !== "none" && (
              <span
                className="flex items-center justify-center shrink-0 shadow-sm ml-2"
                style={{
                  width: `${icoSize}px`,
                  height: `${icoSize}px`,
                  borderRadius: icoRadius,
                  backgroundColor: b1.iconBg,
                  color: b1.iconColor,
                }}
              >
                {ICONS[b1.icon] || ICONS.arrow}
              </span>
            )}
          </Btn1Tag>
        )}

        {b2?.show && (
          <Btn2Tag
            {...(Btn2Tag === "button" ? { type: "button" } : {})}
            data-sec="cta2"
            onClick={(e: React.MouseEvent) => {
              if (onCta2Click) {
                e.preventDefault();
                onCta2Click();
              } else {
                handleSec(e, "cta2");
              }
            }}
            className={`flex items-center justify-between font-semibold shadow-md active:scale-[0.98] transition-all select-none ${
              isClickable ? "cursor-pointer" : "cursor-default"
            }`}
            style={{
              height: `${L.buttonHeight}px`,
              borderRadius: radius,
              padding: `0 ${pad - 1}px 0 ${Math.round(L.buttonHeight * 0.42) - 1}px`,
              color: b2.color,
              fontSize: `${L.buttonFont}px`,
              backgroundColor:
                b2.variant === "solid"
                  ? b2.bg
                  : b2.variant === "glass"
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
              border: `1.5px solid ${b2.variant === "solid" ? b2.bg : b2.borderColor}`,
              backdropFilter: b2.variant === "glass" ? "blur(10px)" : undefined,
              WebkitBackdropFilter: b2.variant === "glass" ? "blur(10px)" : undefined,
            }}
          >
            <span className="tracking-tight">{b2.text}</span>
            {b2.icon !== "none" && (
              <span
                className="flex items-center justify-center shrink-0 shadow-sm ml-2"
                style={{
                  width: `${icoSize}px`,
                  height: `${icoSize}px`,
                  borderRadius: icoRadius,
                  backgroundColor: b2.iconBg,
                  color: b2.iconColor,
                }}
              >
                {ICONS[b2.icon] || ICONS.image}
              </span>
            )}
          </Btn2Tag>
        )}
      </div>
    );
  };

  /* Footer Piece */
  const renderFooter = () => {
    if (!c.footer?.show) return null;
    return (
      <div
        data-sec="footer"
        onClick={(e) => handleSec(e, "footer")}
        className={interactive ? "cursor-pointer text-center text-xs opacity-90 select-none" : "text-center text-xs opacity-90 select-none"}
        style={{
          padding: `${L.footerGap}px ${side}px 0`,
          color: c.footer.color,
        }}
      >
        {c.footer.text}
      </div>
    );
  };

  const renderBottomSpacer = () => <div style={{ height: `${L.bottomPadding}px`, flexShrink: 0 }} />;

  /* Background & Gradient Overlay Piece */
  const renderShade = (mode: "bottom" | "top" | "flat") => {
    let grad = "";
    if (mode === "bottom") {
      grad = `linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,${bg.fade}) 100%), `;
    } else if (mode === "top") {
      grad = `linear-gradient(to bottom, rgba(0,0,0,${(bg.fade * 0.5).toFixed(2)}) 0%, rgba(0,0,0,0) 40%), `;
    }
    return (
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `${grad}rgba(0,0,0,${bg.overlay})`,
        }}
      />
    );
  };

  const renderPhoto = (mode: "bottom" | "top" | "flat") => (
    <>
      <div
        data-sec="background"
        onClick={(e) => handleSec(e, "background")}
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-auto"
        style={{
          backgroundImage: bgImg,
          backgroundPosition: `center ${bg.posY}%`,
        }}
      />
      {renderShade(mode)}
    </>
  );

  /* Container wrapper */
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
    fontFamily: `'${g.font}', system-ui, -apple-system, sans-serif`,
    WebkitFontSmoothing: "antialiased",
  };

  /* Switch variant */
  switch (V) {
    case "center":
      return (
        <div style={{ ...containerStyle, backgroundColor: bg.color }}>
          {renderPhoto("bottom")}
          <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-between">
            {renderHeader()}
            <div className="flex-1" />
            {renderTitle("center", 0)}
            {renderInfo("center")}
            <div className="flex-1" />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );

    case "sheet": {
      const ph = Math.min(80, Math.max(30, L.photoHeight || 54));
      return (
        <div style={{ ...containerStyle, backgroundColor: surface }}>
          <div
            className="relative overflow-hidden"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: `${ph}%`,
              backgroundColor: bg.color,
            }}
          >
            {renderPhoto("top")}
          </div>

          <div className="relative z-10 flex flex-col">{renderHeader()}</div>

          <div
            className="absolute left-0 right-0 bottom-0 z-20 flex flex-col rounded-t-[28px] shadow-[0_-10px_30px_rgba(0,0,0,0.14)] pt-6"
            style={{
              top: `calc(${ph}% - 26px)`,
              backgroundColor: surface,
            }}
          >
            {renderTitle(c.title.align, 0)}
            {renderInfo(c.info.align)}
            <div className="flex-1" />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );
    }

    case "polaroid":
      return (
        <div style={{ ...containerStyle, backgroundColor: surface }}>
          <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-between">
            {renderHeader()}
            <div
              className="flex-1 min-h-0 flex justify-center items-center py-4"
              style={{ padding: `16px ${side + 10}px 8px` }}
            >
              <div
                data-sec="background"
                onClick={(e) => handleSec(e, "background")}
                className="w-full max-w-[320px] flex flex-col bg-white rounded-md shadow-[0_18px_40px_rgba(0,0,0,0.22)] -rotate-2 p-2.5 pb-8 cursor-pointer"
              >
                <div
                  className="relative overflow-hidden flex-1 min-h-[220px] rounded-sm"
                  style={{ backgroundColor: bg.color }}
                >
                  {renderPhoto("flat")}
                </div>
              </div>
            </div>
            {renderTitle("center", 8)}
            {renderInfo("center")}
            <div style={{ height: "16px", flexShrink: 0 }} />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );

    case "arch":
      return (
        <div style={{ ...containerStyle, backgroundColor: surface }}>
          <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-between">
            {renderHeader()}
            <div
              className="relative flex-1 min-h-0 my-3"
              style={{ margin: `16px ${side + 24}px 0` }}
            >
              <div
                className="absolute inset-0 rounded-t-[999px] rounded-b-[6px] translate-x-2.5 -translate-y-2.5 pointer-events-none"
                style={{ border: `1.5px solid ${accent}` }}
              />
              <div
                className="relative overflow-hidden w-full h-full rounded-t-[999px] rounded-b-[6px]"
                style={{ backgroundColor: bg.color }}
              >
                {renderPhoto("flat")}
              </div>
            </div>
            {renderTitle("center", 14)}
            {renderInfo("center")}
            <div style={{ height: "14px", flexShrink: 0 }} />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );

    case "editorial":
      return (
        <div style={{ ...containerStyle, backgroundColor: bg.color }}>
          {renderPhoto("bottom")}
          <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-between">
            {renderHeader(true)}
            <div className="flex-1" />
            <div
              className="w-11 h-[3px] shrink-0 mb-3"
              style={{
                backgroundColor: accent,
                marginLeft: `${side}px`,
              }}
            />
            {renderTitle("left", 0, { lineHeight: 1.02 })}
            {renderInfo("left")}
            <div style={{ height: "20px", flexShrink: 0 }} />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );

    default: // Classic
      return (
        <div style={{ ...containerStyle, backgroundColor: bg.color }}>
          {renderPhoto("bottom")}
          <div className="relative z-10 flex-1 flex flex-col min-h-0 justify-between">
            {renderHeader()}
            {renderTitle(c.title.align, c.title.top)}
            {renderInfo(c.info.align)}
            <div className="flex-1" />
            {renderButtons()}
            {renderFooter()}
            {renderBottomSpacer()}
          </div>
        </div>
      );
  }
}
