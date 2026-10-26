import {
  updateProfileRequestSchema,
  updateProfileResponseSchema,
} from "@/lib/contracts/onboarding";
import { updateProfile } from "@/lib/server/account/profile";
import { route } from "@/lib/server/http/route";

/**
 * PATCH /api/profile
 *
 * Updates the signed-in user's name and specialty.
 * Contract: lib/contracts/onboarding.ts
 */
export const PATCH = route("/api/profile", {
  access: "user",
  body: updateProfileRequestSchema,
  response: updateProfileResponseSchema,
  handler: async ({ user, body }) => {
    return updateProfile(user, body);
  },
});
