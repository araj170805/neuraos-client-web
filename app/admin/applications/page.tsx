import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { ApplicationsContainer } from "@/components/admin/ApplicationsContainer";

export const metadata: Metadata = { title: "Applications — NeuraOS admin" };

export default function AdminApplicationsPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Applications" subtitle="Doctor verification" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto max-w-admin">
          <ApplicationsContainer />
        </div>
      </div>
    </main>
  );
}
