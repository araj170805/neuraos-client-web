import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { DEFAULT_DAILY_SPEND_CAP_USD } from "../lib/limits";

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

const db = getFirestore(app, process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || "(default)");

async function main() {
  try {
    const configRef = db.doc("config/app");
    const snap = await configRef.get();

    const defaultConfig = {
      aiEnabled: true,
      groupsEnabled: true,
      contributionsEnabled: true,
      dailySpendCapUsd: DEFAULT_DAILY_SPEND_CAP_USD,
    };

    if (snap.exists) {
      console.log("Existing config/app:", snap.data());
      await configRef.set(defaultConfig, { merge: true });
      console.log("✓ Merged default config into config/app");
    } else {
      await configRef.set(defaultConfig);
      console.log("✓ Initialized config/app with default config:", defaultConfig);
    }
  } catch (error) {
    console.error("Error seeding config/app:", error);
    process.exit(1);
  }
}

main();
