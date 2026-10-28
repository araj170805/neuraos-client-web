import type { Metadata } from "next";
import { ContributionReviewContainer } from "@/components/admin/ContributionReviewContainer";

export const metadata: Metadata = { title: "Contribution — NeuraOS admin" };

export default async function AdminContributionPage({ params }: PageProps<"/admin/contributions/[id]">) {
  const { id } = await params;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ContributionReviewContainer id={id} />
    </main>
  );
}
