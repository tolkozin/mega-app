"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore, type ConfigPatch } from "@/stores/chat-store";
import { useConfigStore } from "@/stores/config-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { ChatMessage } from "./ChatMessage";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useProfile } from "@/hooks/useProfile";
import { isActivePlan } from "@/lib/plan-limits";

import { getModelDef, getBaseEngine } from "@/lib/model-registry";

const ENGINE_METRICS: Record<string, string> = {
  subscription: "MRR, churn, LTV/CAC, ARPU",
  ecommerce: "AOV, ROAS, margins, CAC",
  saas: "ARR, NRR, CAC payback, Rule of 40",
};

const ENGINE_TIPS: Record<string, string> = {
  subscription: '"What are the key assumptions?" or "What\'s my projected breakeven?"',
  ecommerce: '"How can I improve my unit economics?" or "What\'s my CAC payback period?"',
  saas: '"What\'s my Rule of 40?" or "What\'s my projected ARR?"',
};

function getWelcomeMessage(modelType: string): string {
  const def = getModelDef(modelType);
  const engine = getBaseEngine(modelType);
  const metrics = ENGINE_METRICS[engine] ?? ENGINE_METRICS.subscription;
  const tips = ENGINE_TIPS[engine] ?? ENGINE_TIPS.subscription;
  return `Welcome to your ${def.label} dashboard. All projections are built on industry benchmarks and real-world data points for your market segment.

Here's what I can help with:

• Answer questions about your metrics (${metrics})
• Adjust parameters — describe what you want to change in plain English
• Upload a CSV/text file with your data and I'll extract parameters automatically
• Generate an investor report with benchmarks and recommendations

Try: ${tips}`;
}

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
  const { profile } = useProfile();
  const readOnly = !isActivePlan(profile?.plan ?? "expired");

  const [input, setInput] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingPatch, scrollToBottom]);

  // Auto-open panel with welcome message when dashboard first loads (skip on mobile)
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && !isMobile) inputRef.current?.focus();
  }, [isOpen, isMobile]);
  const hasShownWelcome = useRef(false);
  useEffect(() => {
    if (isMobile) return;
    if (hasShownWelcome.current || !modelType || messages.length > 0) return;
    const welcome = modelType ? getWelcomeMessage(modelType) : null;
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
    if (readOnly) {
      useUpgradeStore.getState().showExpiredModal();
      return;
    }
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
    if (readOnly) {
      useUpgradeStore.getState().showExpiredModal();
      return;
    }
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
        if (res.status === 429) {
          useUpgradeStore.getState().showUpgradeModal({
            feature: "AI messages",
            currentPlan: err.plan || "free",
            limitValue: err.detail || "monthly AI message limit",
          });
        }
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
    if (readOnly) {
      e.target.value = "";
      useUpgradeStore.getState().showExpiredModal();
      return;
    }
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
        if (res.status === 429) {
          useUpgradeStore.getState().showUpgradeModal({
            feature: "AI messages",
            currentPlan: data.plan || "free",
            limitValue: data.detail || "monthly AI message limit",
          });
        }
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
    if (readOnly) {
      useUpgradeStore.getState().showExpiredModal();
      return;
    }
    setReportLoading(true);

    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelType, dashboardContext }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          useUpgradeStore.getState().showUpgradeModal({
            feature: "AI reports",
            currentPlan: data.plan || "free",
            limitValue: data.detail || "monthly AI report limit",
          });
        }
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

  const SUGGESTIONS = [
    { label: "Optimize costs", icon: "chart" },
    { label: "Compare scenarios", icon: "compare" },
    { label: "Explain metrics", icon: "lightbulb" },
  ];

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-white flex flex-col safe-area-inset"
          : "w-[380px] xl:w-[420px] border border-[#eef0f6] bg-white shrink-0 flex flex-col shadow-v2-sm rounded-2xl overflow-hidden my-2 mr-2"
      }
      data-tour="ai-chat"
      style={{ fontFamily: "Lato, sans-serif" }}
    >
      {/* ── Header (Figma Make style) ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: "18px 20px 16px", borderBottom: "1px solid #f0f1f7" }}
      >
        <div className="flex items-center gap-3">
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
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #2163E7, #1650b0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(33,99,231,0.35)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
              <path d="M12 2L14.09 7.26L20 8.27L16 12.14L16.18 18.02L12 15.77L7.82 18.02L8 12.14L4 8.27L9.91 7.26L12 2Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#1a1a2e" }}>AI Assistant</div>
            <div className="flex items-center gap-1.5" style={{ marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
              <span style={{ fontSize: 10.5, color: "#9ca3af" }}>Revenue Map Intelligence</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearMessages}
            title="Clear chat"
            className="text-[#8181A5] hover:text-[#1C1D21] text-[11px] font-medium px-2 py-1 rounded-lg hover:bg-[#F0F0F5] transition-colors"
          >
            Clear
          </button>
          {!fullscreen && (
            <button
              onClick={closePanel}
              style={{
                width: 30, height: 30, borderRadius: 9,
                border: "1.5px solid #eef0f6",
                background: "#f8f9fc",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              className="hover:bg-[#f0f1f7] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Usage bar ── */}
      <div className="px-5 py-2 border-b border-[#f0f1f7] flex items-center gap-4 text-[10.5px] text-[#9ca3af]">
        {chatUsage && (
          <span>Chats: {chatUsage.current}/{chatUsage.limit}</span>
        )}
        {reportUsage && (
          <span>Reports: {reportUsage.current}/{reportUsage.limit}</span>
        )}
        {!dashboardContext && (
          <span className="text-amber-500">No data loaded</span>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && !report && (
          <div className="text-center mt-8">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, #2163E7, #1650b0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 16px rgba(33,99,231,0.3)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                <path d="M12 2L14.09 7.26L20 8.27L16 12.14L16.18 18.02L12 15.77L7.82 18.02L8 12.14L4 8.27L9.91 7.26L12 2Z" />
              </svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>Ask me anything</p>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Questions about metrics, scenarios,<br />or parameter adjustments
            </p>
          </div>
        )}

        {displayMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Config Patch Preview Card (Figma Make scenario card style) */}
        {pendingPatch && (
          <div style={{
            background: "linear-gradient(135deg, #f0f5ff, #e8f0fe)",
            border: "1.5px solid #dce9fb",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: "#2163E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                  <path d="M12 2L14.09 7.26L20 8.27L16 12.14L16.18 18.02L12 15.77L7.82 18.02L8 12.14L4 8.27L9.91 7.26L12 2Z" />
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e" }}>Suggested Changes</span>
            </div>

            <div className="space-y-1.5" style={{ fontSize: 12, color: "#4b5e8a", marginBottom: 12 }}>
              {pendingPatch.top && Object.entries(pendingPatch.top).length > 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>General</span>
                  {Object.entries(pendingPatch.top).map(([key, val]) => (
                    <div key={key} className="flex items-baseline justify-between gap-2 ml-1 min-w-0" style={{ marginTop: 2 }}>
                      <span style={{ color: "#4b5e8a" }}>{formatFieldName(key)}</span>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#EBF1FD", color: "#1650b0",
                        borderRadius: 99, padding: "2px 9px",
                        fontSize: 11.5, fontWeight: 800,
                      }}>
                        {formatValue(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {pendingPatch.phases && Object.entries(pendingPatch.phases).map(([phase, fields]) => (
                Object.keys(fields).length > 0 && (
                  <div key={phase}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phase {phase}</span>
                    {Object.entries(fields).map(([key, val]) => (
                      <div key={key} className="flex items-baseline justify-between gap-2 ml-1 min-w-0" style={{ marginTop: 2 }}>
                        <span style={{ color: "#4b5e8a" }}>{formatFieldName(key)}</span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#EBF1FD", color: "#1650b0",
                          borderRadius: 99, padding: "2px 9px",
                          fontSize: 11.5, fontWeight: 800,
                        }}>
                          {formatValue(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>

            <div className="flex gap-2">
              {patchApplied ? (
                <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }} className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 7l3.5 3.5L12 4" />
                  </svg>
                  Applied to model
                </span>
              ) : (
                <>
                  <button
                    onClick={applyPatch}
                    className="flex items-center gap-1.5"
                    style={{
                      background: "#2163E7", color: "#fff", border: "none",
                      borderRadius: 8, padding: "7px 14px",
                      fontSize: 12, fontWeight: 800, cursor: "pointer",
                    }}
                  >
                    Apply to model
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { clearPendingPatch(); setPatchApplied(false); }}
                    style={{
                      background: "transparent", border: "1.5px solid #c5d7f8",
                      borderRadius: 8, padding: "7px 12px",
                      fontSize: 12, fontWeight: 700, color: "#2163E7",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {report && (
          <div style={{ background: "#f8f9fc", borderRadius: 12, padding: 16 }} className="space-y-3">
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>{report.title}</h3>
            {report.sections.map((section, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#2163E7", marginBottom: 4 }}>{section.heading}</h4>
                <p style={{ fontSize: 12, color: "#4b5e8a", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{section.content}</p>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestion chips + Report + Input ── */}
      <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #f0f1f7", flexShrink: 0, background: "#fff" }}>
        {/* Suggestion chips */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 10 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.label)}
              className="flex items-center gap-1.5 hover:bg-[#EBF1FD] hover:border-[#2163E7] hover:text-[#2163E7] transition-all"
              style={{
                background: "#f5f6fa",
                border: "1.5px solid #eef0f6",
                borderRadius: 99, padding: "5px 12px",
                fontSize: 11.5, fontWeight: 700,
                color: "#6b7280", cursor: "pointer",
                fontFamily: "Lato, sans-serif",
              }}
            >
              {s.icon === "chart" && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              )}
              {s.icon === "compare" && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 16l4-8 4 4 6-6" /></svg>
              )}
              {s.icon === "lightbulb" && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" /></svg>
              )}
              {s.label}
            </button>
          ))}
          <button
            onClick={generateReport}
            disabled={reportLoading || !dashboardContext}
            className="flex items-center gap-1.5 hover:bg-[#EBF1FD] hover:border-[#2163E7] hover:text-[#2163E7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#f5f6fa",
              border: "1.5px solid #eef0f6",
              borderRadius: 99, padding: "5px 12px",
              fontSize: 11.5, fontWeight: 700,
              color: "#6b7280", cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h10M7 12h10M7 17h6" />
            </svg>
            {reportLoading ? "Generating..." : "AI Report"}
          </button>
        </div>

        {/* Input row */}
        <div className="flex gap-2 items-end">
          {/* File upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || fileUploading}
            title="Upload CSV/text file"
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: "1.5px solid #eef0f6", background: "#f8f9fc",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            className="hover:border-[#2163E7] hover:text-[#2163E7] transition-colors text-[#9ca3af] disabled:opacity-50"
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

          {/* Text input */}
          <div
            className="flex-1 flex items-center gap-2"
            style={{
              background: "#f8f9fc",
              border: "1.5px solid #eef0f6",
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.borderColor = "#2163E7"; }}
              onBlur={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.borderColor = "#eef0f6"; }}
              placeholder="Ask about your revenue model..."
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-[16px] sm:text-[13px] text-[#1a1a2e] placeholder:text-[#9ca3af]"
              style={{ fontFamily: "Lato, sans-serif", lineHeight: 1.5 }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: input.trim() ? "linear-gradient(135deg, #2163E7, #1650b0)" : "#eef0f6",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              flexShrink: 0,
              transition: "background 0.15s",
              boxShadow: input.trim() ? "0 4px 12px rgba(33,99,231,0.35)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
