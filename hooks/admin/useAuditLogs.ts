"use client";

import { useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminAuditLog } from "@/lib/contracts/admin";

/** The latest 100 audit entries, newest first. */
export function useAuditLogs(): AdminQuery<AdminAuditLog[]> {
  return useAdminQuery("audit", async () => (await api.admin.listAuditLogs({ limit: 100 })).items);
}
