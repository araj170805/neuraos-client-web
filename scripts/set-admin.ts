import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  "demo-neuraos";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId,
      });

const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  const email = process.argv[2]?.trim();
  if (!email) {
    console.error("Usage: bun run scripts/set-admin.ts <email>");
    process.exit(1);
  }

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, {
      ...user.customClaims,
      admin: true,
    });
    console.log(`✓ Admin custom claim set for ${email} (uid: ${user.uid})`);

    const userRef = db.doc(`users/${user.uid}`);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({ role: "admin" });
      console.log(`✓ Updated role to 'admin' in users/${user.uid}`);
    } else {
      console.log(
        `ℹ Note: users/${user.uid} document does not exist yet (user hasn't completed onboarding). Role will display as admin once onboarded.`,
      );
    }
  } catch (error) {
    console.error("Error setting admin claim:", error);
    process.exit(1);
  }
}

main();
