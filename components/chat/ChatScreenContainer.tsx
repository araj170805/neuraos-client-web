"use client";

import { notFound } from "next/navigation";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { chats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { messagesByChat } from "@/lib/fixtures/messages";
import { signedInUser } from "@/lib/fixtures/users";

/** Client side of /chat/[chatId]. Static: fixtures. At integration: useChat, useMessages, useFiles. */
export function ChatScreenContainer({ chatId }: { chatId: string }) {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) notFound();

  return (
    <ChatScreen
      key={chat.id}
      chat={chat}
      messages={messagesByChat[chat.id] ?? []}
      files={filesByChat[chat.id] ?? []}
      currentUid={signedInUser.id}
    />
  );
}
