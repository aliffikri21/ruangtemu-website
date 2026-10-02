import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RUANGTEMU Digital: Platform Photobooth Modern Palopo",
  description:
    "Platform photobooth modern di Kota Palopo dan Tana Luwu. Layanan cetak fisik kilat, Virtual Web Photobooth dari HP tamu, live projection videotron, dan audio guestbook.",
  keywords: [
    "photobooth palopo",
    "sewa photobooth palopo",
    "virtual photobooth",
    "wedding photobooth palopo",
    "ruangtemu digital",
    "photobooth luwu",
  ],
  authors: [{ name: "RUANGTEMU PHOTOBOOTH Palopo" }],
  openGraph: {
    title: "RUANGTEMU Digital: Platform Photobooth Modern",
    description: "Abadikan setiap momen bermakna bersama RUANGTEMU Photobooth Palopo.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#fafaf9] text-zinc-900 font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
