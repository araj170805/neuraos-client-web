"use client";

import NextLink from "next/link";
import { ContributeGate } from "@/components/account/ContributeGate";
import { ContributionCard } from "@/components/account/ContributionCard";
import { contributionSummary } from "@/components/account/contributionSummary";
import { contributionTabs, tabOf, type ContributionTab } from "@/components/account/contributionTabs";
import { ContributionTabsControl } from "@/components/account/ContributionTabsControl";
import { PageStatus } from "@/components/app/PageStatus";
import { TopBar } from "@/components/app/TopBar";
import { Icon } from "@/components/ui/Icon";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";
import { useContributions } from "@/hooks/account/useContributions";
import { useProfile } from "@/hooks/account/useProfile";

/** Client side of /contribute: the user's case studies by tab, or why they can't contribute yet. */
export function ContributeListContainer({ tab }: { tab: ContributionTab }) {
  const profile = useProfile();
  const contributions = useContributions();
  const ready = profile.data && !contributions.loading;
  const unverified = profile.data !== null && !profile.data.canContribute;

  const summaries = contributions.data.map(contributionSummary);
  const counts = Object.fromEntries(
    contributionTabs.map((t) => [t.value, summaries.filter((c) => tabOf(c.status) === t.value).length]),
  ) as Record<ContributionTab, number>;
  const visible = summaries.filter((c) => tabOf(c.status) === tab);

  return (
    <>
      <TopBar title="Case studies" subtitle="Train NeuraOS">
        {ready && !unverified && (
          <Text
            as={NextLink}
            href="/contribute/new"
            variant={keyTextVariant("app-accent-sm")}
            className={keyClassName("app-accent-sm")}
          >
            <Icon name="plus-sm" size={12} />
            <span className="max-sm:sr-only">New case study</span>
          </Text>
        )}
      </TopBar>
      {!ready ? (
        <PageStatus error={profile.error ?? contributions.error} />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-6">
          <div className="mx-auto flex max-w-cases flex-col gap-5">
            {unverified ? (
              <ContributeGate reason="unverified" />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <ContributionTabsControl value={tab} counts={counts} />
                  <Text variant="caption" className="text-muted">
                    NeuraOS reviews every case before it is used for training.
                  </Text>
                </div>
                {visible.length > 0 ? (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.75rem),1fr))] gap-3.5">
                    {visible.map((c) => (
                      <ContributionCard key={c.id} contribution={c} />
                    ))}
                  </ul>
                ) : (
                  <Text variant="body" className="py-12 text-center text-muted">
                    Nothing here yet.
                  </Text>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
