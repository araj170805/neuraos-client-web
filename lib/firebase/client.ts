import "client-only";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Browser Firebase SDK. Clients only READ Firestore (onSnapshot / getDoc);
 * every write goes through lib/api/client.ts. Storage is never used directly.
 *
 * NEXT_PUBLIC_ values must be referenced literally so Next can inline them.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Initialised on first use, so importing this module never throws before .env.local is filled in. */
function firebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function clientAuth(): Auth {
  return getAuth(firebaseApp());
}

export function clientDb(): Firestore {
  return getFirestore(firebaseApp(), process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || "(default)");
}

/**
 * The signed-in user's Firebase ID token, or null when signed out.
 * Waits for the persisted session to restore, so it is safe to call right after page load.
 * Used by AuthProvider (getIdToken) and lib/api/client.ts.
 */
export async function currentIdToken(): Promise<string | null> {
  const auth = clientAuth();
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
