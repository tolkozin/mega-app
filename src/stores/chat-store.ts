import { create } from "zustand";

export interface ConfigPatch {
  type: string;
  top?: Record<string, unknown>;
  phases?: Record<string, Record<string, unknown>>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ReportSection {
  heading: string;
  content: string;
}

export interface AIReport {
  title: string;
  generated_at: string;
  sections: ReportSection[];
}

interface ChatStore {
  // Panel state
  isOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  appendToLastAssistant: (chunk: string) => void;
  clearMessages: () => void;

  // Streaming state
  isStreaming: boolean;
  setStreaming: (v: boolean) => void;

  // Dashboard context
  modelType: string;
  dashboardContext: string;
  setDashboardContext: (modelType: string, context: string) => void;

  // Report
  report: AIReport | null;
  reportLoading: boolean;
  setReport: (r: AIReport | null) => void;
  setReportLoading: (v: boolean) => void;

  // Config patch from AI
  pendingPatch: ConfigPatch | null;
  setPendingPatch: (patch: ConfigPatch | null) => void;
  clearPendingPatch: () => void;

  // Usage counters (display-only, server is authoritative)
  chatUsage: { current: number; limit: number; remaining: number } | null;
  reportUsage: { current: number; limit: number; remaining: number } | null;
  setChatUsage: (u: { current: number; limit: number; remaining: number }) => void;
  setReportUsage: (u: { current: number; limit: number; remaining: number }) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),

  messages: [],
  addMessage: (role, content) =>
    set((s) => {
      const newMsg: ChatMessage = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, timestamp: Date.now() };
      const msgs = [...s.messages, newMsg];
      // Cap at 100 messages to prevent memory growth in long sessions
      return { messages: msgs.length > 100 ? msgs.slice(-100) : msgs };
    }),
  appendToLastAssistant: (chunk) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      }
      return { messages: msgs };
    }),
  clearMessages: () => set({ messages: [], report: null }),

  isStreaming: false,
  setStreaming: (v) => set({ isStreaming: v }),

  modelType: "",
  dashboardContext: "",
  setDashboardContext: (modelType, context) => set({ modelType, dashboardContext: context }),

  report: null,
  reportLoading: false,
  setReport: (r) => set({ report: r }),
  setReportLoading: (v) => set({ reportLoading: v }),

  pendingPatch: null,
  setPendingPatch: (patch) => set({ pendingPatch: patch }),
  clearPendingPatch: () => set({ pendingPatch: null }),

  chatUsage: null,
  reportUsage: null,
  setChatUsage: (u) => set({ chatUsage: u }),
  setReportUsage: (u) => set({ reportUsage: u }),
}));
