import type { Metadata } from "next";
import { ChatScreenContainer } from "@/components/chat/ChatScreenContainer";
import { chats } from "@/lib/fixtures/chats";

export async function generateMetadata({ params }: PageProps<"/chat/[chatId]">): Promise<Metadata> {
  const { chatId } = await params;
  return { title: `${chats.find((chat) => chat.id === chatId)?.title ?? "Chat"} — NeuraOS` };
}

/** The chat itself; its data is read on the client (ChatScreenContainer). */
export default async function ChatRoute({ params }: PageProps<"/chat/[chatId]">) {
  const { chatId } = await params;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ChatScreenContainer chatId={chatId} />
    </main>
  );
}
