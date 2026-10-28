import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { ContributionsContainer } from "@/components/admin/ContributionsContainer";

export const metadata: Metadata = { title: "Contributions — NeuraOS admin" };

export default function AdminContributionsPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Contributions" subtitle="Case studies for training" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto max-w-admin">
          <ContributionsContainer />
        </div>
      </div>
    </main>
  );
}
