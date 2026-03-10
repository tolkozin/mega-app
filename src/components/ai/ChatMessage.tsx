"use client";

import type { ChatMessage as ChatMessageType } from "@/stores/chat-store";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-[#5E81F4] text-white"
            : "bg-[#F0F0F5] text-[#1C1D21]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
