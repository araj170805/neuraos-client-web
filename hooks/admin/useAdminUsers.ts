"use client";

import { allPages, useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminUser } from "@/lib/contracts/admin";

/** Every user account. */
export function useAdminUsers(): AdminQuery<AdminUser[]> {
  return useAdminQuery("users", () => allPages((cursor) => api.admin.listUsers({ cursor, limit: 100 })));
}
