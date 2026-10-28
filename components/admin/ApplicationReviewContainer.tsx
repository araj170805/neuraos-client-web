"use client";

import { notFound } from "next/navigation";
import { ApplicationReview } from "@/components/admin/ApplicationReview";
import { PageStatus } from "@/components/app/PageStatus";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useApplications } from "@/hooks/admin/useApplications";

/** Client side of one application review. */
export function ApplicationReviewContainer({ id }: { id: string }) {
  const applications = useApplications();
  const users = useAdminUsers();
  if (!applications.data || !users.data) return <PageStatus error={applications.error ?? users.error} />;

  const application = applications.data.find((a) => a.id === id);
  if (!application) notFound();
  const nameOf = (uid: string | null) => users.data?.find((u) => u.uid === uid)?.name;

  return (
    <ApplicationReview
      application={application}
      email={users.data.find((u) => u.uid === application.uid)?.email ?? "—"}
      reviewer={nameOf(application.reviewerUid) ?? "Admin"}
      onDecide={(body) => applications.decide(application.id, body)}
      documentUrl={(doc) => applications.documentUrl(application.id, doc)}
    />
  );
}
