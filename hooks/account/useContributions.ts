"use client";

import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "@/hooks/firestore/useCollection";
import type { Live } from "@/hooks/firestore/useDocument";
import { useAuth } from "@/hooks/useAuth";
import { clientDb } from "@/lib/firebase/client";
import type { ContributionDoc, WithId } from "@/lib/types";

/** The user's own contributions, newest first, live (index: contributorUid + createdAt desc). */
export function useContributions(): Live<WithId<ContributionDoc>[]> {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;
  const live = useCollection<ContributionDoc>(uid && `contributions:${uid}`, () =>
    query(collection(clientDb(), "contributions"), where("contributorUid", "==", uid), orderBy("createdAt", "desc")),
  );
  return { ...live, loading: loading || live.loading };
}
