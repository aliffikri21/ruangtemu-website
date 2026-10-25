import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  weight: ["600", "700", "800"],
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ruangtemu.online"),
  title: "RUANGTEMU",
  description:
    "Platform photobooth modern di Kota Palopo dan Tana Luwu. Layanan Photobooth Fisik cetak instan, Virtual Web Photobooth dari HP tamu, dan audio guestbook.",
  keywords: [
    "photobooth palopo",
    "sewa photobooth palopo",
    "virtual photobooth",
    "wedding photobooth palopo",
    "ruangtemu digital",
    "photobooth luwu",
    "ruangtemu.online",
  ],
  authors: [{ name: "RUANGTEMU PHOTOBOOTH Palopo" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RUANGTEMU",
    description: "Abadikan setiap momen bermakna bersama RUANGTEMU Photobooth Palopo.",
    url: "https://ruangtemu.online",
    siteName: "RUANGTEMU",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Allura&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Poppins:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${cinzel.variable} ${playfair.variable} min-h-screen bg-[#fafaf9] text-zinc-900 font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
