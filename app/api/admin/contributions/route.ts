import {
  listContributionsQuerySchema,
  listContributionsResponseSchema,
} from "@/lib/contracts/admin";
import { listAdminContributions } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/contributions
 *
 * Lists contributions by reviewable status.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/contributions", {
  access: "admin",
  query: listContributionsQuerySchema,
  response: listContributionsResponseSchema,
  handler: async ({ query }) => {
    return listAdminContributions(query);
  },
});
