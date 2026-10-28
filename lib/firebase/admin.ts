import "server-only";
import { applicationDefault, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAppCheck, type AppCheck } from "firebase-admin/app-check";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { requireEnv } from "@/lib/server/env";

/**
 * Admin SDK: the only way the app writes to Firestore and Storage.
 * Credentials come from Application Default Credentials: the App Hosting
 * service account in production, `gcloud auth application-default login` locally.
 */
function adminApp(): App {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    credential: applicationDefault(),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  });
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export function adminAppCheck(): AppCheck {
  return getAppCheck(adminApp());
}

export function adminDb(): Firestore {
  return getFirestore(adminApp(), requireEnv("NEXT_PUBLIC_FIRESTORE_DATABASE_ID"));
}

/** The default bucket (chat files, verification documents, contribution audio). */
export function adminBucket() {
  return getStorage(adminApp()).bucket();
}
