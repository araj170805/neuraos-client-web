"use client";

import { auditRows } from "@/components/admin/auditRows";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { SpendCard } from "@/components/admin/SpendCard";
import { StatCard } from "@/components/admin/StatCard";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";
import { useAuditLogs } from "@/hooks/admin/useAuditLogs";
import { useConfig } from "@/hooks/admin/useConfig";

/** Client side of the admin overview: queue counts, users, spend cap and recent decisions. */
export function OverviewContainer() {
  const applications = useApplications();
  const contributions = useAdminContributions();
  const users = useAdminUsers();
  const config = useConfig();
  const audit = useAuditLogs();

  if (!applications.data || !contributions.data || !users.data || !audit.data) {
    return <PageStatus error={applications.error ?? contributions.error ?? users.error ?? audit.error} />;
  }

  const pending = applications.data.filter((a) => a.status === "pending").length;
  const waiting = applications.data.filter((a) => a.status === "needs_info").length;
  const toReview = contributions.data.filter((c) => c.status === "submitted");
  const flagged = toReview.filter((c) => (c.piiCheck?.flags.length ?? 0) > 0).length;
  const total = users.data.length;
  const verified = users.data.filter((u) => u.verificationStatus === "approved").length;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
      <div className="mx-auto flex max-w-admin flex-col gap-7.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] gap-3.5">
          <StatCard label="Pending applications" value={String(pending)} sub={`${waiting} waiting on applicants`} href="/admin/applications" attention={pending > 0} />
          <StatCard label="Contributions to review" value={String(toReview.length)} sub={`${flagged} with PII flags`} href="/admin/contributions" attention={toReview.length > 0} />
          <StatCard label="Total users" value={String(total)} sub="All sign-ups" href="/admin/users" />
          <StatCard label="Verified doctors" value={String(verified)} sub={`${Math.round((verified / Math.max(1, total)) * 100)}% of users`} href="/admin/users" />
          <SpendCard spend={null} cap={config.data?.dailySpendCapUsd ?? 0} />
        </div>
        <RecentActivity entries={auditRows(audit.data.slice(0, 5), users.data, applications.data, contributions.data)} />
      </div>
    </div>
  );
}
