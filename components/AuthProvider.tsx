"use client";

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onboard } from "@/components/account/onboard";
import { clientAuth, currentIdToken } from "@/lib/firebase/client";
import { uiPreview } from "@/lib/firebase/preview";

export type AuthState = {
  /** Null when signed out (or while `loading`). */
  user: User | null;
  /** True until Firebase restores the session on page load. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Same token lib/api/client.ts sends; null when signed out. */
  getIdToken: () => Promise<string | null>;
  /** The `admin` custom claim (UI only; every admin route checks it on the server). */
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);

/** Firebase Auth state for the app. Read it with useAuth(). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!uiPreview);
  const [isAdmin, setIsAdmin] = useState(uiPreview);

  useEffect(() => {
    if (uiPreview) return;
    return onAuthStateChanged(clientAuth(), (next) => {
      setUser(next);
      setLoading(false);
      if (!next) return setIsAdmin(false);
      // Retried on the next page load if it fails.
      onboard(next.uid).catch(() => {});
      next
        .getIdTokenResult()
        .then((result) => setIsAdmin(result.claims.admin === true))
        .catch(() => setIsAdmin(false));
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        await signInWithPopup(clientAuth(), new GoogleAuthProvider());
      },
      signOut: () => signOut(clientAuth()),
      getIdToken: currentIdToken,
      isAdmin,
    }),
    [user, loading, isAdmin],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
