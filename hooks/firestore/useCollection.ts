"use client";

import { onSnapshot, type Query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import type { Live } from "@/hooks/firestore/useDocument";
import type { WithId } from "@/lib/types";

type State<T> = { key: string | null; data: WithId<T>[]; error: Error | null };

/**
 * Live Firestore query. `key` identifies the query (null skips); it re-subscribes
 * only when the key changes, so `build` can create a new Query each render.
 * Queries must include the constraint the rules check (rules are not filters).
 */
export function useCollection<T>(key: string | null, build: () => Query): Live<WithId<T>[]> {
  const [state, setState] = useState<State<T>>({ key: null, data: [], error: null });
  const buildRef = useRef(build);

  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    if (!key) return;
    return onSnapshot(
      buildRef.current(),
      (snap) => setState({ key, data: snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })), error: null }),
      (error) => setState({ key, data: [], error }),
    );
  }, [key]);

  if (!key) return { data: [], loading: false, error: null };
  const current = state.key === key;
  return { data: current ? state.data : [], loading: !current, error: current ? state.error : null };
}
