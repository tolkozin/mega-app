"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import { ChatMessage } from "./ChatMessage";
import { VoiceInput } from "./VoiceInput";

export function AIChatPanel() {
  const {
    isOpen,
    closePanel,
    messages,
    addMessage,
    appendToLastAssistant,
    clearMessages,
    isStreaming,
    setStreaming,
    modelType,
    dashboardContext,
    report,
    reportLoading,
    setReport,
    setReportLoading,
    chatUsage,
    reportUsage,
    setChatUsage,
    setReportUsage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput("");

    addMessage("user", msg);
    addMessage("assistant", "");
    setStreaming(true);

    try {
      const history = messages
        .filter((m) => m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, modelType: modelType || "general", dashboardContext, history }),
      });

      if (!res.ok) {
        const err = await res.json();
        appendToLastAssistant(err.detail ? `${err.error}: ${err.detail}` : (err.error || "Something went wrong."));
        if (err.usage) setChatUsage(err.usage);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        appendToLastAssistant("No response stream.");
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.content) {
              appendToLastAssistant(data.content);
            }
            if (data.done && data.usage) {
              setChatUsage(data.usage);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      appendToLastAssistant("Failed to connect to AI service.");
    } finally {
      setStreaming(false);
    }
  };

  const generateReport = async () => {
    if (reportLoading || !dashboardContext) return;
    setReportLoading(true);

    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelType, dashboardContext }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.usage) setReportUsage(data.usage);
        addMessage("assistant", data.error || "Report generation failed.");
        return;
      }

      setReport(data.report);
      if (data.usage) setReportUsage(data.usage);
    } catch {
      addMessage("assistant", "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-[#E8E8EF] shadow-xl flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } max-lg:hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8EF]">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#5E81F4]">
            <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.18 18.02L10 15.77L5.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" fill="currentColor" />
          </svg>
          <span className="font-semibold text-sm text-[#1C1D21]">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearMessages}
            title="Clear chat"
            className="text-[#8181A5] hover:text-[#1C1D21] text-xs px-2 py-1 rounded hover:bg-[#F0F0F5]"
          >
            Clear
          </button>
          <button
            onClick={closePanel}
            className="text-[#8181A5] hover:text-[#1C1D21] w-7 h-7 flex items-center justify-center rounded hover:bg-[#F0F0F5]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
      </div>

      {/* Usage bar */}
      <div className="px-4 py-2 border-b border-[#E8E8EF] flex items-center gap-4 text-xs text-[#8181A5]">
        {chatUsage && (
          <span>
            Chats: {chatUsage.current}/{chatUsage.limit}
          </span>
        )}
        {reportUsage && (
          <span>
            Reports: {reportUsage.current}/{reportUsage.limit}
          </span>
        )}
        {!dashboardContext && (
          <span className="text-amber-500">No data loaded</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !report && (
          <div className="text-center text-sm text-[#8181A5] mt-8">
            <p className="mb-2">Ask questions about your financial model</p>
            <p className="text-xs">e.g. &quot;What&apos;s my projected MRR?&quot;</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {report && (
          <div className="bg-[#F8F8FC] rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[#1C1D21]">{report.title}</h3>
            {report.sections.map((section, i) => (
              <div key={i}>
                <h4 className="font-medium text-xs text-[#5E81F4] mb-1">{section.heading}</h4>
                <p className="text-xs text-[#3A3A4A] whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Report button */}
      <div className="px-4 py-2 border-t border-[#E8E8EF]">
        <button
          onClick={generateReport}
          disabled={reportLoading || !dashboardContext}
          className="w-full text-xs py-2 rounded-md border border-[#5E81F4] text-[#5E81F4] hover:bg-[#5E81F4] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reportLoading ? "Generating Report..." : "Generate AI Report"}
        </button>
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-[#E8E8EF]">
        <div className="flex items-end gap-2">
          <VoiceInput
            onTranscript={(text) => sendMessage(text)}
            disabled={isStreaming}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-[#E8E8EF] px-3 py-2 text-sm focus:outline-none focus:border-[#5E81F4] placeholder:text-[#C4C4D4]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[#5E81F4] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 1L7 7M13 1L9 13L7 7L1 5L13 1Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
