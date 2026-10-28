"use client";

import { VerifyScreen } from "@/components/account/VerifyScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { useProfile } from "@/hooks/account/useProfile";
import { useVerification } from "@/hooks/account/useVerification";

/** Client side of /verify: the live application, real uploads and submit. */
export function VerifyContainer() {
  const profile = useProfile();
  const verification = useVerification();
  if (!profile.data || verification.loading) {
    return <PageStatus error={profile.error ?? verification.error} />;
  }
  return (
    <VerifyScreen
      key={verification.data?.id ?? "new"}
      application={verification.data}
      defaults={{ fullName: profile.data.name, specialty: profile.data.specialty ?? "" }}
      upload={verification.upload}
      onSubmit={verification.submit}
    />
  );
}
