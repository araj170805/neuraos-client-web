"use client";

import { contributionSummary } from "@/components/account/contributionSummary";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useContributions } from "@/hooks/account/useContributions";
import { useProfile } from "@/hooks/account/useProfile";
import { uiPreview } from "@/lib/firebase/preview";
import { myContributions } from "@/lib/fixtures/account";
import { chats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Client side of the app sidebar: the live profile and case studies.
 * Chats and their files are still fixtures until useChats / useFiles land.
 */
export function ChatSidebarContainer() {
  const profile = useProfile();
  const contributions = useContributions();

  return (
    <ChatSidebar
      chats={chats}
      filesByChat={filesByChat}
      contributions={(uiPreview ? myContributions : contributions.data).map(contributionSummary)}
      user={profile.data ?? (uiPreview ? signedInUser : null)}
    />
  );
}
