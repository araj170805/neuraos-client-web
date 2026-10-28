"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type AdminQuery<T> = { data: T | null; loading: boolean; error: Error | null; refresh: () => void };

/* One version for all admin data: a decision bumps it and every admin list refetches. */
let version = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Refetch every mounted admin list (after a decision or a config change). */
export function refreshAdminData() {
  version += 1;
  listeners.forEach((listener) => listener());
}

type State<T> = { key: string; data: T | null; error: Error | null };

/** Fetches admin data through the API (admins read lists via /api/admin/*). */
export function useAdminQuery<T>(name: string, load: () => Promise<T>): AdminQuery<T> {
  const current = useSyncExternalStore(subscribe, () => version, () => version);
  const key = `${name}#${current}`;
  const [state, setState] = useState<State<T> | null>(null);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => !cancelled && setState({ key, data, error: null }),
      (error: Error) => !cancelled && setState((prev) => ({ key, data: prev?.data ?? null, error })),
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    // Keep showing the previous data while a refresh loads.
    data: state?.data ?? null,
    loading: state?.key !== key,
    error: state?.key === key ? state.error : null,
    refresh: refreshAdminData,
  };
}

/** Follows `nextCursor` until the list ends (alpha volumes are small). */
export async function allPages<T>(
  page: (cursor: string | undefined) => Promise<{ items: T[]; nextCursor: string | null }>,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  do {
    const result = await page(cursor);
    items.push(...result.items);
    cursor = result.nextCursor ?? undefined;
  } while (cursor);
  return items;
}
