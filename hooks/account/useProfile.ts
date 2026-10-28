"use client";

import { useDocument, type Live } from "@/hooks/firestore/useDocument";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api/client";
import type { UpdateProfileRequest } from "@/lib/contracts/onboarding";
import type { UserDoc, WithId } from "@/lib/types";

export type ProfileState = Live<WithId<UserDoc> | null> & {
  /** PATCH /api/profile; the listener picks up the change. */
  save: (body: UpdateProfileRequest) => Promise<void>;
};

/**
 * The signed-in user's live `users/{uid}` doc. `data` stays null for a moment
 * after the first sign-in, until onboarding has created it.
 */
export function useProfile(): ProfileState {
  const { user, loading } = useAuth();
  const live = useDocument<UserDoc>(user ? `users/${user.uid}` : null);
  return {
    ...live,
    loading: loading || live.loading,
    save: async (body) => {
      await api.profile.update(body);
    },
  };
}
