"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentSummary, ModelChoice } from "@/lib/openclaw-client";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  agentConfig?: Partial<AgentSummary>;
  progress?: { label: string; status: "done" | "loading" | "pending" }[];
  actions?: { label: string; action: string }[];
};

type AppState = {
  // Connection
  gatewayUrl: string;
  gatewayToken: string;
  isConnected: boolean;
  setConnection: (url: string, token: string) => void;
  setConnected: (v: boolean) => void;

  // Theme
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Agents
  agents: AgentSummary[];
  setAgents: (agents: AgentSummary[]) => void;

  // Models
  models: ModelChoice[];
  setModels: (models: ModelChoice[]) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Current agent being edited
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gatewayUrl: "",
      gatewayToken: "",
      isConnected: false,
      setConnection: (url, token) => set({ gatewayUrl: url, gatewayToken: token }),
      setConnected: (v) => set({ isConnected: v }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      agents: [],
      setAgents: (agents) => set({ agents }),

      models: [],
      setModels: (models) => set({ models }),

      chatMessages: [],
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      selectedAgentId: null,
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),
    }),
    {
      name: "openclaw-agent-builder",
      partialize: (state) => ({
        gatewayUrl: state.gatewayUrl,
        gatewayToken: state.gatewayToken,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
