"use client";

import { ContributionsTable } from "@/components/admin/ContributionsTable";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";

/** Client side of the contributions queue. */
export function ContributionsContainer() {
  const contributions = useAdminContributions();
  if (!contributions.data) return <PageStatus error={contributions.error} />;
  return <ContributionsTable contributions={contributions.data} />;
}
