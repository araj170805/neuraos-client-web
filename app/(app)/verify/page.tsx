import type { Metadata } from "next";
import { VerifyContainer } from "@/components/account/VerifyContainer";
import { uiPreview } from "@/lib/firebase/preview";

export const metadata: Metadata = { title: "Doctor verification — NeuraOS" };

/** In UI preview, ?state=none|pending|needs_info|rejected forces a state. */
export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const { state } = await searchParams;
  const forced = uiPreview && typeof state === "string" ? state : null;

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <VerifyContainer forced={forced} />
    </main>
  );
}
