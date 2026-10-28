import type { Metadata } from "next";
import { VerifyContainer } from "@/components/account/VerifyContainer";

export const metadata: Metadata = { title: "Doctor verification — NeuraOS" };

export default function VerifyPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <VerifyContainer />
    </main>
  );
}
