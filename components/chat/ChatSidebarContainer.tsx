"use client";

import { contributionSummary } from "@/components/account/contributionSummary";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useAuth } from "@/hooks/useAuth";
import { myContributions } from "@/lib/fixtures/account";
import { chats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Client side of the app sidebar. Fixture timestamps carry functions, so they
 * can't cross from a Server Component; the data is read here instead.
 * The user card shows the signed-in Google account until useProfile lands;
 * chats and case studies are still fixtures until useChats / useContributions.
 */
export function ChatSidebarContainer() {
  const { user } = useAuth();
  const card = user
    ? {
        ...signedInUser,
        name: user.displayName ?? user.email ?? "You",
        email: user.email ?? "",
        photoUrl: user.photoURL,
        specialty: null,
        verification: { status: "none" as const, applicationId: null, verifiedAt: null },
      }
    : signedInUser;

  return (
    <ChatSidebar
      chats={chats}
      filesByChat={filesByChat}
      contributions={myContributions.map(contributionSummary)}
      user={card}
    />
  );
}
