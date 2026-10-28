"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/hooks/useAuth";

/** Sidebar-footer row that signs out and returns to the landing page. */
export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  return (
    <Text
      as="button"
      type="button"
      variant="body-sm"
      onClick={async () => {
        await signOut();
        router.replace("/");
      }}
      className="flex h-10 cursor-pointer items-center gap-2.5 rounded-card px-3.5 text-copy hover:bg-ink/4 hover:text-ink"
    >
      <Icon name="sign-out" size={14} />
      Sign out
    </Text>
  );
}
