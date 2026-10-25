import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RUANGTEMU",
    short_name: "RUANGTEMU",
    description:
      "Platform Photobooth Modern di Kota Palopo & Tana Luwu: Photobooth Fisik Cetak Instan dan Virtual Web Photobooth.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#18181b",
    icons: [
      {
        src: "/icon.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
