import type { Metadata } from "next";
import MaintenanceView from "./maintenance-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Perawatan RUANGTEMU",
  description: "Booth RUANGTEMU sedang dalam perawatan sistem berkala.",
  other: {
    "claude:viewport-fit-sides": "cover",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return <MaintenanceView />;
}

