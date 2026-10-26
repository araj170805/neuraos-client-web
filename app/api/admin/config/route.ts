import {
  updateConfigRequestSchema,
  updateConfigResponseSchema,
} from "@/lib/contracts/admin";
import { updateAdminConfig } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * PATCH /api/admin/config
 *
 * Updates config/app toggles and spend cap.
 * Contract: lib/contracts/admin.ts
 */
export const PATCH = route("/api/admin/config", {
  access: "admin",
  body: updateConfigRequestSchema,
  response: updateConfigResponseSchema,
  handler: async ({ user, body }) => {
    return updateAdminConfig(user, body);
  },
});
