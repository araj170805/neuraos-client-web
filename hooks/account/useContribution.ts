"use client";

import { useDocument, type Live } from "@/hooks/firestore/useDocument";
import type { ContributionDoc, WithId } from "@/lib/types";

/** One of the user's contributions, live (null while loading or if it doesn't exist). */
export function useContribution(id: string | null): Live<WithId<ContributionDoc> | null> {
  return useDocument<ContributionDoc>(id ? `contributions/${id}` : null);
}
