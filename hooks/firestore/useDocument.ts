"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import type { WithId } from "@/lib/types";

export type Live<T> = { data: T; loading: boolean; error: Error | null };

type State<T> = { path: string | null; data: WithId<T> | null; error: Error | null };

/**
 * Live Firestore document at `path` (null skips). `data` is null while loading
 * or when the document doesn't exist. Reads only; writes go through lib/api.
 */
export function useDocument<T>(path: string | null): Live<WithId<T> | null> {
  const [state, setState] = useState<State<T>>({ path: null, data: null, error: null });

  useEffect(() => {
    if (!path) return;
    return onSnapshot(
      doc(clientDb(), path),
      (snap) => setState({ path, data: snap.exists() ? { ...(snap.data() as T), id: snap.id } : null, error: null }),
      (error) => setState({ path, data: null, error }),
    );
  }, [path]);

  if (!path) return { data: null, loading: false, error: null };
  const current = state.path === path;
  return { data: current ? state.data : null, loading: !current, error: current ? state.error : null };
}
