import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { todayLabel } from "@/components/admin/adminLabels";
import { OverviewContainer } from "@/components/admin/OverviewContainer";

export const metadata: Metadata = { title: "Admin — NeuraOS" };

export default function AdminOverviewPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Overview" subtitle={todayLabel()} />
      <OverviewContainer />
    </main>
  );
}
