"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { errorMessage } from "@/lib/api/client";

type SignedDocumentProps = {
  fileName: string;
  /** Fetches a short-lived signed URL for the file. */
  load: () => Promise<string>;
  size: "card" | "full";
};

const frame = { card: "h-60 w-85", full: "h-[80dvh] w-[min(56rem,90vw)]" };

/** A verification document: images inline, PDFs in a frame, from a signed URL. */
export function SignedDocument({ fileName, load, size }: SignedDocumentProps) {
  const [state, setState] = useState<{ url: string } | { error: string } | null>(null);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  // Fetch once per document; a new signed URL on every render would reload it.
  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (url) => !cancelled && setState({ url }),
      (error) => !cancelled && setState({ error: errorMessage(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [fileName]);

  if (!state || "error" in state) {
    return (
      <Text role={state ? "alert" : "status"} variant="body-sm" className={`${frame[size]} flex items-center justify-center gap-2.5 text-muted`}>
        {state ? state.error : <Spinner />}
        {!state && "Loading document…"}
      </Text>
    );
  }

  if (fileName.toLowerCase().endsWith(".pdf")) {
    return <iframe src={state.url} title={fileName} className={`${frame[size]} rounded-card bg-paper`} />;
  }
  return (
    <Image
      src={state.url}
      alt={fileName}
      width={1200}
      height={1600}
      unoptimized
      className={`${frame[size]} rounded-card bg-paper object-contain`}
    />
  );
}
