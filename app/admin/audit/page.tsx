import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { AuditContainer } from "@/components/admin/AuditContainer";

export const metadata: Metadata = { title: "Audit log — NeuraOS admin" };

export default function AdminAuditPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Audit log" subtitle="Every admin decision, newest first" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto max-w-admin">
          <AuditContainer />
        </div>
      </div>
    </main>
  );
}
