import { UserCard } from "@/components/account/UserCard";
import type { ContributionSummary } from "@/components/account/ContributeNavigator";
import { groupChatsByDay } from "@/components/chat/chatGroups";
import { SidebarBody } from "@/components/chat/SidebarBody";
import type { ChatDoc, FileDoc, UserDoc } from "@/lib/types";

type ChatSidebarProps = {
  chats: (ChatDoc & { id: string })[];
  filesByChat: Record<string, (FileDoc & { id: string })[]>;
  contributions: ContributionSummary[];
  /** Null while the profile loads. */
  user: UserDoc | null;
};

/** App sidebar: brand, chat or case-study navigation, and the user card. */
export function ChatSidebar({ chats, filesByChat, contributions, user }: ChatSidebarProps) {
  const verified = user?.verification.status === "approved";
  return (
    <>
      <SidebarBody groups={groupChatsByDay(chats)} filesByChat={filesByChat} contributions={contributions} />
      <div className="shrink-0 px-3 pt-3 pb-4">
        {user && (
          <UserCard
            name={user.name}
            subtitle={[user.specialty, verified ? "Verified doctor" : null].filter(Boolean).join(" · ") || user.email}
          />
        )}
      </div>
    </>
  );
}
