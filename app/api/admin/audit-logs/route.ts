import {
  listAuditLogsQuerySchema,
  listAuditLogsResponseSchema,
} from "@/lib/contracts/admin";
import { listAdminAuditLogs } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/audit-logs
 *
 * Lists audit logs, newest first.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/audit-logs", {
  access: "admin",
  query: listAuditLogsQuerySchema,
  response: listAuditLogsResponseSchema,
  handler: async ({ query }) => {
    return listAdminAuditLogs(query);
  },
});
