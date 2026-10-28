"use client";

import { allPages, refreshAdminData, useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import {
  reviewableContributionStatusSchema,
  type AdminContribution,
  type ContributionDecisionRequest,
} from "@/lib/contracts/admin";

export type AdminContributionsState = AdminQuery<AdminContribution[]> & {
  decide: (id: string, body: ContributionDecisionRequest) => Promise<void>;
  /** Short-lived signed URL for a voice contribution's recording. */
  audioUrl: (id: string) => Promise<string>;
};

/** Every submitted-or-later contribution (all statuses), newest first. */
export function useAdminContributions(): AdminContributionsState {
  const query = useAdminQuery("contributions", async () => {
    const lists = await Promise.all(
      reviewableContributionStatusSchema.options.map((status) =>
        allPages((cursor) => api.admin.listContributions({ status, cursor, limit: 100 })),
      ),
    );
    return lists.flat().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });

  return {
    ...query,
    decide: async (id, body) => {
      await api.admin.decideContribution(id, body);
      refreshAdminData();
    },
    audioUrl: async (id) => (await api.admin.contributionAudioUrl(id)).url,
  };
}
