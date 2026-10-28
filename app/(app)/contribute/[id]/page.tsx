import type { Metadata } from "next";
import { ContributionContainer } from "@/components/account/ContributionContainer";

export const metadata: Metadata = { title: "Case study — NeuraOS" };

export default async function ContributionPage({ params }: PageProps<"/contribute/[id]">) {
  const { id } = await params;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ContributionContainer id={id} />
    </main>
  );
}
