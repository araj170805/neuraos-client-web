"use client";

import { notFound } from "next/navigation";
import { ContributionReview } from "@/components/admin/ContributionReview";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminContributions } from "@/hooks/admin/useAdminContributions";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";

/** Client side of one contribution review. */
export function ContributionReviewContainer({ id }: { id: string }) {
  const contributions = useAdminContributions();
  const applications = useApplications();
  const users = useAdminUsers();
  if (!contributions.data || !applications.data || !users.data) {
    return <PageStatus error={contributions.error ?? applications.error ?? users.error} />;
  }

  const contribution = contributions.data.find((c) => c.id === id);
  if (!contribution) notFound();
  const by = contribution.contributorUid;

  return (
    <ContributionReview
      contribution={contribution}
      contributor={users.data.find((u) => u.uid === by)}
      registration={applications.data.find((a) => a.uid === by)?.registrationNumber ?? null}
      history={contributions.data.filter((c) => c.contributorUid === by)}
      reviewer={users.data.find((u) => u.uid === contribution.reviewerUid)?.name ?? "Admin"}
      onDecide={(body) => contributions.decide(contribution.id, body)}
      audioUrl={() => contributions.audioUrl(contribution.id)}
    />
  );
}
