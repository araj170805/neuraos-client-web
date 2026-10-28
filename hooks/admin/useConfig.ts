"use client";

import { useDocument, type Live } from "@/hooks/firestore/useDocument";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api/client";
import type { AppConfig, UpdateConfigRequest } from "@/lib/contracts/admin";
import type { AppConfigDoc } from "@/lib/types";

export type ConfigState = Live<AppConfig | null> & {
  /** PATCH /api/admin/config; the listener picks up the change. */
  update: (body: UpdateConfigRequest) => Promise<void>;
};

/** Live `config/app` (admins only by the rules; others get null). */
export function useConfig(): ConfigState {
  const { isAdmin } = useAuth();
  const live = useDocument<AppConfigDoc>(isAdmin ? "config/app" : null);
  const data = live.data
    ? {
        aiEnabled: live.data.aiEnabled,
        groupsEnabled: live.data.groupsEnabled,
        contributionsEnabled: live.data.contributionsEnabled,
        dailySpendCapUsd: live.data.dailySpendCapUsd,
      }
    : null;
  return {
    ...live,
    data,
    update: async (body) => {
      await api.admin.updateConfig(body);
    },
  };
}
