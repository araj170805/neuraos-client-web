/**
 * bun run check:setup — verifies the real Firebase / Vertex setup from .env.local.
 * Prints PASS or FAIL per check. Writes only a throwaway doc in _healthcheck.
 */
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { GoogleGenAI } from "@google/genai";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

type Check = { name: string; run: () => Promise<void> };

async function main() {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      storageBucket: env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    });
  const databaseId = env("NEXT_PUBLIC_FIRESTORE_DATABASE_ID");
  const bucket = getStorage(app).bucket();

  const checks: Check[] = [
    {
      name: `Firestore write and delete (database "${databaseId}")`,
      run: async () => {
        const ref = getFirestore(app, databaseId).collection("_healthcheck").doc();
        await ref.set({ at: new Date().toISOString() });
        await ref.delete();
      },
    },
    {
      name: `Storage bucket "${bucket.name}" exists`,
      run: async () => {
        const [exists] = await bucket.exists();
        if (!exists) throw new Error("bucket not found");
      },
    },
    {
      name: "Signed upload URL",
      run: async () => {
        const [url] = await bucket.file("_healthcheck/test.txt").getSignedUrl({
          version: "v4",
          action: "write",
          expires: Date.now() + 5 * 60 * 1000,
          contentType: "text/plain",
        });
        if (!url.startsWith("https://")) throw new Error("unexpected URL");
      },
    },
    {
      name: `Gemini "${env("GEMINI_FAST_MODEL")}" via Vertex AI`,
      run: async () => {
        const ai = new GoogleGenAI({
          vertexai: true,
          project: env("GOOGLE_CLOUD_PROJECT"),
          location: env("GOOGLE_CLOUD_LOCATION"),
        });
        const res = await ai.models.generateContent({ model: env("GEMINI_FAST_MODEL"), contents: "Reply with OK" });
        if (!res.text) throw new Error("empty reply");
      },
    },
  ];

  let failed = 0;
  for (const check of checks) {
    try {
      await check.run();
      console.log(`PASS  ${check.name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}

void main();
