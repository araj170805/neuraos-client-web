import {
  listUsersQuerySchema,
  listUsersResponseSchema,
} from "@/lib/contracts/admin";
import { listAdminUsers } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/users
 *
 * Lists all users with verification status and referral counts.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/users", {
  access: "admin",
  query: listUsersQuerySchema,
  response: listUsersResponseSchema,
  handler: async ({ query }) => {
    return listAdminUsers(query);
  },
});
