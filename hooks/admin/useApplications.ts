"use client";

import { allPages, refreshAdminData, useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import {
  applicationStatusSchema,
  type AdminApplication,
  type ApplicationDecisionRequest,
} from "@/lib/contracts/admin";
import type { VerificationDocumentKind } from "@/lib/types";

export type ApplicationsState = AdminQuery<AdminApplication[]> & {
  decide: (id: string, body: ApplicationDecisionRequest) => Promise<void>;
  /** Short-lived signed URL to view one of the applicant's documents. */
  documentUrl: (id: string, doc: { kind: VerificationDocumentKind; fileName: string }) => Promise<string>;
};

/** Every verification application (all statuses), newest first. */
export function useApplications(): ApplicationsState {
  const query = useAdminQuery("applications", async () => {
    const lists = await Promise.all(
      applicationStatusSchema.options.map((status) =>
        allPages((cursor) => api.admin.listApplications({ status, cursor, limit: 100 })),
      ),
    );
    return lists.flat().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });

  return {
    ...query,
    decide: async (id, body) => {
      await api.admin.decideApplication(id, body);
      refreshAdminData();
    },
    documentUrl: async (id, doc) => (await api.admin.applicationDocumentUrl(id, doc)).url,
  };
}
