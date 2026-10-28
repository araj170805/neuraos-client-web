import type { Metadata } from "next";
import { SettingsContainer } from "@/components/admin/SettingsContainer";

export const metadata: Metadata = { title: "Settings — NeuraOS admin" };

export default function AdminSettingsPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <SettingsContainer />
    </main>
  );
}
