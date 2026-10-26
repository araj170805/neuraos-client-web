import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { UpdateProfileRequest } from "@/lib/contracts/onboarding";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";

/**
 * PATCH /api/profile
 *
 * Updates the signed-in user's name and specialty.
 * Contract: lib/contracts/onboarding.ts
 */
export async function updateProfile(
  user: AuthUser,
  body: UpdateProfileRequest,
): Promise<{ ok: true }> {
  const db = adminDb();
  const userRef = db.doc(`users/${user.uid}`);
  const snap = await userRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "User profile not found.");
  }

  const updates: Record<string, unknown> = {
    lastActiveAt: FieldValue.serverTimestamp(),
  };

  if (body.name !== undefined) {
    updates.name = body.name.trim();
  }

  if (body.specialty !== undefined) {
    updates.specialty = body.specialty ? body.specialty.trim() : null;
  }

  await userRef.update(updates);
  return { ok: true };
}
