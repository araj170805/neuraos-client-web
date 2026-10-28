"use client";

import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";

/** Client side of the applications queue. */
export function ApplicationsContainer() {
  const applications = useApplications();
  const users = useAdminUsers();
  if (!applications.data || !users.data) return <PageStatus error={applications.error ?? users.error} />;
  return (
    <ApplicationsTable
      applications={applications.data}
      emails={Object.fromEntries(users.data.map((u) => [u.uid, u.email]))}
    />
  );
}
