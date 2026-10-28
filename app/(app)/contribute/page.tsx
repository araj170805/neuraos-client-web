import type { Metadata } from "next";
import { ContributeListContainer } from "@/components/account/ContributeListContainer";
import { isContributionTab, type ContributionTab } from "@/components/account/contributionTabs";

export const metadata: Metadata = { title: "Case studies — NeuraOS" };

export default async function ContributePage({ searchParams }: PageProps<"/contribute">) {
  const { tab: tabParam } = await searchParams;
  const tab: ContributionTab = isContributionTab(tabParam) ? tabParam : "review";
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ContributeListContainer tab={tab} />
    </main>
  );
}
