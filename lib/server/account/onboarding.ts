import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { AuthUser } from "@/lib/server/http/route";
import type { UserDoc } from "@/lib/types";

/** Generates an 8-character referral code (A–Z, 0–9). */
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

class CodeCollisionError extends Error {
  constructor() {
    super("Referral code collision — will retry");
    this.name = "CodeCollisionError";
  }
}

/**
 * POST /api/onboarding — idempotent.
 *
 * Existing users: returns their current referral code, does nothing else.
 * New users: one transaction that:
 *   1. Creates `users/{uid}` with all fields from SPEC §5.
 *   2. Creates `referralCodes/{newCode}` (retries on collision, up to 5×).
 *   3. If the incoming `referralCode` is valid (exists, belongs to someone else,
 *      and `referrals/{uid}` doesn't already exist): creates `referrals/{uid}`
 *      and increments the referrer's `referralCount`.
 *
 * Existing users are never counted as referrals (SPEC §10).
 */
export async function runOnboarding(
  user: AuthUser,
  referralCode: string | null,
  termsVersion: string,
): Promise<{ isNew: boolean; referralCode: string }> {
  const db = adminDb();
  const userRef = db.doc(`users/${user.uid}`);

  // Fast path: existing user — no write needed.
  const existingSnap = await userRef.get();
  if (existingSnap.exists) {
    const data = existingSnap.data() as UserDoc;
    return { isNew: false, referralCode: data.referralCode };
  }

  const MAX_RETRIES = 5;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const newCode = generateCode();
    let resultCode: string | undefined;
    let isNew = true;

    try {
      await db.runTransaction(async (tx) => {
        // Re-check both inside the transaction to handle races.
        const [userSnap, newCodeSnap] = await Promise.all([
          tx.get(userRef),
          tx.get(db.doc(`referralCodes/${newCode}`)),
        ]);

        // Another concurrent request already created this user; just read their code.
        if (userSnap.exists) {
          resultCode = (userSnap.data() as UserDoc).referralCode;
          isNew = false;
          return;
        }

        // The randomly generated code collides with an existing one — retry.
        if (newCodeSnap.exists) throw new CodeCollisionError();

        // Validate the incoming referral code (SPEC §10: existing users never count).
        let referrerUid: string | null = null;
        if (referralCode) {
          const [incomingCodeSnap, referralDocSnap] = await Promise.all([
            tx.get(db.doc(`referralCodes/${referralCode}`)),
            tx.get(db.doc(`referrals/${user.uid}`)),
          ]);

          if (incomingCodeSnap.exists && !referralDocSnap.exists) {
            const ownerUid = (incomingCodeSnap.data() as { uid: string }).uid;
            // Don't count own code.
            if (ownerUid !== user.uid) {
              referrerUid = ownerUid;
            }
          }
        }

        const now = FieldValue.serverTimestamp();

        // 1. Create the user document (SPEC §5 schema).
        tx.set(userRef, {
          name: user.name ?? "",
          email: user.email ?? "",
          photoUrl: user.picture,
          specialty: null,
          createdAt: now,
          lastActiveAt: now,
          role: "user",
          verification: {
            status: "none",
            applicationId: null,
            verifiedAt: null,
          },
          canContribute: false,
          referralCode: newCode,
          referredBy: referrerUid,
          referralCount: 0,
          qualifiedReferralCount: 0,
          consent: {
            termsVersion,
            contributionTermsVersion: null,
            acceptedAt: now,
          },
        });

        // 2. Claim the referral code.
        tx.set(db.doc(`referralCodes/${newCode}`), {
          uid: user.uid,
          createdAt: now,
        });

        // 3. Count the referral if valid.
        if (referrerUid) {
          tx.set(db.doc(`referrals/${user.uid}`), {
            referrerUid,
            code: referralCode,
            createdAt: now,
            qualifiedAt: null,
          });
          tx.update(db.doc(`users/${referrerUid}`), {
            referralCount: FieldValue.increment(1),
          });
        }

        resultCode = newCode;
      });

      // resultCode is always set: either newCode (new user) or existing code (race).
      return { isNew, referralCode: resultCode! };
    } catch (err) {
      if (err instanceof CodeCollisionError && attempt < MAX_RETRIES - 1) continue;
      throw err;
    }
  }

  throw new Error("Failed to generate a unique referral code after 5 attempts");
}
