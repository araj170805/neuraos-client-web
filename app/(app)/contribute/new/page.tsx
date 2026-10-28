import type { Metadata } from "next";
import { NewContributionContainer } from "@/components/account/NewContributionContainer";

export const metadata: Metadata = { title: "New case study — NeuraOS" };

export default function NewContributionPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <NewContributionContainer />
    </main>
  );
}
