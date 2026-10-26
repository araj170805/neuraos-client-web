import {
  listApplicationsQuerySchema,
  listApplicationsResponseSchema,
} from "@/lib/contracts/admin";
import { listAdminApplications } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/applications
 *
 * Lists verification applications filtered by status.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/applications", {
  access: "admin",
  query: listApplicationsQuerySchema,
  response: listApplicationsResponseSchema,
  handler: async ({ query }) => {
    return listAdminApplications(query);
  },
});
