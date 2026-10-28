import type { Metadata } from "next";
import { ApplicationReviewContainer } from "@/components/admin/ApplicationReviewContainer";

export const metadata: Metadata = { title: "Application — NeuraOS admin" };

export default async function AdminApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ApplicationReviewContainer id={id} />
    </main>
  );
}
