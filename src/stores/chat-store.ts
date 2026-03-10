import { create } from "zustand";

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
    set((s) => ({
      messages: [
        ...s.messages,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, timestamp: Date.now() },
      ],
    })),
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

  chatUsage: null,
  reportUsage: null,
  setChatUsage: (u) => set({ chatUsage: u }),
  setReportUsage: (u) => set({ reportUsage: u }),
}));
