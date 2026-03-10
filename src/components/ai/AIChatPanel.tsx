"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore, type ConfigPatch } from "@/stores/chat-store";
import { useConfigStore } from "@/stores/config-store";
import { ChatMessage } from "./ChatMessage";
import { useIsMobile } from "@/hooks/useMediaQuery";

const WELCOME_MESSAGES: Record<string, string> = {
  subscription: `Hi! I'm your AI financial analyst. Here's what I can do:

• Answer questions about your subscription metrics (MRR, churn, LTV/CAC, etc.)
• Configure your model — just say "set my ad budget to $5000" or "configure phase 2 CPI to $3"
• Upload a CSV/text file with your business data and I'll extract parameters automatically
• Generate a full financial report with benchmarks and recommendations

Try asking: "Help me configure my subscription model" or "What's my projected breakeven?"`,
  ecommerce: `Hi! I'm your AI financial analyst. Here's what I can do:

• Answer questions about your e-commerce metrics (AOV, ROAS, margins, etc.)
• Configure your model — just say "set my ad budget to $5000" or "set CPC to $1.50"
• Upload a CSV/text file with your business data and I'll extract parameters automatically
• Generate a full financial report with benchmarks and recommendations

Try asking: "Help me configure my e-commerce model" or "How's my unit economics?"`,
  saas: `Hi! I'm your AI financial analyst. Here's what I can do:

• Answer questions about your SaaS metrics (ARR, NDR, CAC payback, etc.)
• Configure your model — just say "set price per seat to $49" or "set logo churn to 2%"
• Upload a CSV/text file with your business data and I'll extract parameters automatically
• Generate a full financial report with benchmarks and recommendations

Try asking: "Help me configure my SaaS model" or "What's my projected ARR?"`,
};

/** Extract config_patch JSON from <config_patch>...</config_patch> tags */
function extractConfigPatch(text: string): ConfigPatch | null {
  const match = text.match(/<config_patch>([\s\S]*?)<\/config_patch>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim()) as ConfigPatch;
  } catch {
    return null;
  }
}

/** Strip <config_patch> tags from displayed text */
function stripConfigPatchTags(text: string): string {
  return text.replace(/<config_patch>[\s\S]*?<\/config_patch>/g, "").trim();
}

/** Format a field name for display: ad_budget → Ad Budget */
function formatFieldName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format a value for display */
function formatValue(value: unknown): string {
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return String(value);
}

export function AIChatPanel({ fullscreen = false }: { fullscreen?: boolean }) {
  const {
    isOpen,
    openPanel,
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
    pendingPatch,
    setPendingPatch,
    clearPendingPatch,
  } = useChatStore();

  const configStore = useConfigStore();

  const [input, setInput] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingPatch, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Auto-open panel with welcome message when dashboard first loads (skip on mobile)
  const isMobile = useIsMobile();
  const hasShownWelcome = useRef(false);
  useEffect(() => {
    if (isMobile) return;
    if (hasShownWelcome.current || !modelType || messages.length > 0) return;
    const welcome = WELCOME_MESSAGES[modelType];
    if (!welcome) return;
    hasShownWelcome.current = true;
    openPanel();
    addMessage("assistant", welcome);
  }, [isMobile, modelType, messages.length, openPanel, addMessage]);

  // Check for config_patch after streaming completes
  useEffect(() => {
    if (isStreaming) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const patch = extractConfigPatch(last.content);
    if (patch) {
      setPendingPatch(patch);
      setPatchApplied(false);
    }
  }, [isStreaming, messages, setPendingPatch]);

  const applyPatch = () => {
    if (!pendingPatch) return;
    const mt = pendingPatch.type || modelType;

    // Apply top-level fields
    if (pendingPatch.top) {
      if (mt === "subscription") configStore.setSubscriptionConfig(pendingPatch.top as Record<string, number>);
      else if (mt === "ecommerce") configStore.setEcommerceConfig(pendingPatch.top as Record<string, number>);
      else if (mt === "saas") configStore.setSaasConfig(pendingPatch.top as Record<string, number>);
    }

    // Apply phase-level fields
    if (pendingPatch.phases) {
      for (const [phaseNum, phaseData] of Object.entries(pendingPatch.phases)) {
        const p = Number(phaseNum) as 1 | 2 | 3;
        if (p < 1 || p > 3) continue;
        if (mt === "subscription") configStore.setSubscriptionPhase(p, phaseData as Record<string, number>);
        else if (mt === "ecommerce") configStore.setEcommercePhase(p, phaseData as Record<string, number>);
        else if (mt === "saas") configStore.setSaasPhase(p, phaseData as Record<string, number>);
      }
    }

    setPatchApplied(true);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput("");
    clearPendingPatch();
    setPatchApplied(false);

    addMessage("user", msg);
    addMessage("assistant", "");
    setStreaming(true);

    try {
      const history = messages
        .filter((m) => m.content.length > 0)
        .map((m) => ({ role: m.role, content: stripConfigPatchTags(m.content) }));
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    setFileUploading(true);
    clearPendingPatch();
    setPatchApplied(false);
    addMessage("user", `Uploaded file: ${file.name}`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modelType", modelType || "subscription");

      const res = await fetch("/api/ai/configure", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        addMessage("assistant", data.error || "File analysis failed.");
        if (data.usage) setReportUsage(data.usage);
        return;
      }

      if (data.config_patch) {
        setPendingPatch(data.config_patch);
        addMessage("assistant", data.explanation || "I extracted the following parameters from your file:");
      } else {
        addMessage("assistant", "Could not extract any parameters from this file.");
      }
      if (data.usage) setReportUsage(data.usage);
    } catch {
      addMessage("assistant", "Failed to upload file.");
    } finally {
      setFileUploading(false);
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

  // For ChatMessage rendering: strip config_patch tags from displayed content
  const displayMessages = messages.map((msg) =>
    msg.role === "assistant"
      ? { ...msg, content: stripConfigPatchTags(msg.content) }
      : msg
  );

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-white flex flex-col"
          : "w-[320px] lg:w-[320px] md:w-[260px] h-full border-l border-[#E8E8EF] bg-white shrink-0 flex flex-col"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8EF]">
        <div className="flex items-center gap-2">
          {fullscreen && (
            <button
              onClick={closePanel}
              className="text-[#8181A5] hover:text-[#1C1D21] w-7 h-7 flex items-center justify-center rounded hover:bg-[#F0F0F5] mr-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 1L2 7l7 6" />
              </svg>
            </button>
          )}
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
          {!fullscreen && (
            <button
              onClick={closePanel}
              className="text-[#8181A5] hover:text-[#1C1D21] w-7 h-7 flex items-center justify-center rounded hover:bg-[#F0F0F5]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
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
            <p className="text-xs mt-1">or &quot;Set my ad budget to $5000&quot;</p>
          </div>
        )}

        {displayMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Config Patch Preview Card */}
        {pendingPatch && (
          <div className="bg-[#F0F4FF] border border-[#5E81F4]/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#5E81F4] shrink-0">
                <path d="M13.3 2.7L11.3 0.7C11.1 0.5 10.8 0.5 10.6 0.7L1.3 10L0 16L6 14.7L15.3 5.4C15.5 5.2 15.5 4.9 15.3 4.7L13.3 2.7Z" fill="currentColor" opacity="0.2" />
                <path d="M1.3 10L10.6 0.7C10.8 0.5 11.1 0.5 11.3 0.7L13.3 2.7C13.5 2.9 13.5 3.2 13.3 3.4L4 12.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="font-medium text-xs text-[#1C1D21]">Suggested Config Changes</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {pendingPatch.top && Object.entries(pendingPatch.top).length > 0 && (
                <div>
                  <span className="text-[#8181A5] font-medium">General:</span>
                  {Object.entries(pendingPatch.top).map(([key, val]) => (
                    <div key={key} className="flex items-baseline justify-between gap-2 ml-2 min-w-0">
                      <span className="text-[#3A3A4A] break-words min-w-0">{formatFieldName(key)}</span>
                      <span className="font-medium text-[#1C1D21] shrink-0 text-right">{formatValue(val)}</span>
                    </div>
                  ))}
                </div>
              )}

              {pendingPatch.phases && Object.entries(pendingPatch.phases).map(([phase, fields]) => (
                Object.keys(fields).length > 0 && (
                  <div key={phase}>
                    <span className="text-[#8181A5] font-medium">Phase {phase}:</span>
                    {Object.entries(fields).map(([key, val]) => (
                      <div key={key} className="flex items-baseline justify-between gap-2 ml-2 min-w-0">
                        <span className="text-[#3A3A4A] break-words min-w-0">{formatFieldName(key)}</span>
                        <span className="font-medium text-[#1C1D21] shrink-0 text-right">{formatValue(val)}</span>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              {patchApplied ? (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 7l3.5 3.5L12 4" />
                  </svg>
                  Applied to model
                </span>
              ) : (
                <>
                  <button
                    onClick={applyPatch}
                    className="flex-1 text-xs py-1.5 rounded-md bg-[#5E81F4] text-white hover:bg-[#4A6DE0] transition-colors"
                  >
                    Apply to Model
                  </button>
                  <button
                    onClick={() => { clearPendingPatch(); setPatchApplied(false); }}
                    className="text-xs py-1.5 px-3 rounded-md border border-[#E8E8EF] text-[#8181A5] hover:text-[#1C1D21] hover:bg-[#F0F0F5] transition-colors"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
      <div className="px-4 py-3 border-t border-[#E8E8EF]" style={{ paddingBottom: fullscreen ? "max(12px, env(safe-area-inset-bottom))" : undefined }}>
        <div className="flex items-end gap-2">
          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || fileUploading}
            title="Upload CSV/text file"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E8EF] text-[#8181A5] hover:text-[#5E81F4] hover:border-[#5E81F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {fileUploading ? (
              <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="20 14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 8.5V11.5C12.5 12.05 12.05 12.5 11.5 12.5H2.5C1.95 12.5 1.5 12.05 1.5 11.5V8.5" />
                <path d="M7 1.5V9.5M4 4.5L7 1.5L10 4.5" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={handleFileUpload}
            className="hidden"
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
