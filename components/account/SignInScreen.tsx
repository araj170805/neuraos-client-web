"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { TERMS_VERSION } from "@/components/account/options";
import { readReferralCode } from "@/components/account/referralCookie";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/hooks/useAuth";
import { uiPreview } from "@/lib/firebase/preview";

const noop = () => () => {};

/** Only same-site paths, so ?next= can't send people to another site. */
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/chat";
}

/**
 * Sign-in card. Signs in with Google, then returns to ?next=. AuthProvider then
 * runs onboarding (user doc, referral code, the referral cookie).
 * In UI preview mode sign-in is simulated.
 */
export function SignInScreen() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const referral = useSyncExternalStore(noop, readReferralCode, () => null);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (user) router.replace(safeNext());
  }, [user, router]);

  async function signIn() {
    setBusy(true);
    setFailed(false);
    try {
      if (uiPreview) await new Promise((resolve) => setTimeout(resolve, 900));
      else await signInWithGoogle();
      if (uiPreview) router.replace(safeNext());
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1 flex w-full max-w-card flex-col items-center gap-5.5 rounded-sheet-sm border border-ink/8 bg-paper px-7 pt-7 pb-6.5 text-center shadow-sheet">
      <div className="flex flex-col items-center gap-2.5">
        <Text as="p" variant="badge" className="text-muted">
          For doctors
        </Text>
        <Text as="h1" variant="status-title" className="text-balance">
          Sign in to NeuraOS
        </Text>
        <Text variant="body" className="max-w-80 text-muted text-pretty">
          A second opinion for your hardest cases, grounded in your reports.
        </Text>
      </div>

      {referral && (
        <Text variant="body-sm" className="w-full rounded-callout border border-accent/28 bg-accent/8 px-4 py-2.5 text-accent">
          A colleague invited you. Welcome.
        </Text>
      )}

      <div className="flex w-full flex-col gap-3 text-left">
        <Checkbox checked={accepted} onChange={(event) => setAccepted(event.target.checked)}>
          <Text as="span" variant="body-sm" className="text-ink-soft">
            I agree to the NeuraOS terms ({TERMS_VERSION}). Answers are general medical information, not a diagnosis.
          </Text>
        </Checkbox>
        <Button look="app-accent-xl" className="w-full" disabled={!accepted || busy} onClick={signIn}>
          <GoogleMark />
          {busy ? "Signing in…" : "Continue with Google"}
        </Button>
        {failed && (
          <Text role="alert" variant="body-sm" className="text-center text-danger-text">
            Sign-in didn&apos;t finish. Please try again.
          </Text>
        )}
      </div>
    </div>
  );
}
