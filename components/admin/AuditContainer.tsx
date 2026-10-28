"use client";

import { AuditTable } from "@/components/admin/AuditTable";
import { auditRows } from "@/components/admin/auditRows";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";
import { useAuditLogs } from "@/hooks/admin/useAuditLogs";

/** Client side of the audit log. */
export function AuditContainer() {
  const audit = useAuditLogs();
  const users = useAdminUsers();
  const applications = useApplications();
  const contributions = useAdminContributions();
  if (!audit.data || !users.data || !applications.data || !contributions.data) {
    return <PageStatus error={audit.error ?? users.error ?? applications.error ?? contributions.error} />;
  }
  return <AuditTable entries={auditRows(audit.data, users.data, applications.data, contributions.data)} />;
}
