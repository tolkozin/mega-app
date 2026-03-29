"use client";

import { motion } from "framer-motion";
import type { ChatMessage as ChatMessageType } from "@/stores/chat-store";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 mr-2 mt-0.5"
          style={{
            width: 24, height: 24, borderRadius: 8,
            background: "linear-gradient(135deg, #2163E7, #1650b0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
            <path d="M12 2L14.09 7.26L20 8.27L16 12.14L16.18 18.02L12 15.77L7.82 18.02L8 12.14L4 8.27L9.91 7.26L12 2Z" />
          </svg>
        </div>
      )}
      <div
        className="max-w-[78%] text-[13px] leading-relaxed whitespace-pre-wrap break-words"
        style={{
          background: isUser ? "#2163E7" : "#fff",
          color: isUser ? "#fff" : "#1a1a2e",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 16px",
          padding: "10px 14px",
          border: isUser ? "none" : "1.5px solid #eef0f6",
          boxShadow: isUser
            ? "0 2px 8px rgba(33,99,231,0.2)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          fontFamily: "Lato, sans-serif",
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
