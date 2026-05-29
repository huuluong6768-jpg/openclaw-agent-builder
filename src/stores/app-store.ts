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

export type ProviderType = "gateway" | "openai" | "anthropic" | "custom";

export type ProviderConfig = {
  type: ProviderType;
  // Custom / OpenAI-compatible provider
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  // Direct OpenAI
  openaiApiKey: string;
  openaiModel: string;
  // Direct Anthropic
  anthropicApiKey: string;
  anthropicModel: string;
};

type AppState = {
  // Connection
  gatewayUrl: string;
  gatewayToken: string;
  isConnected: boolean;
  setConnection: (url: string, token: string) => void;
  setConnected: (v: boolean) => void;

  // Provider config
  providerConfig: ProviderConfig;
  setProviderConfig: (config: Partial<ProviderConfig>) => void;

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

const defaultProviderConfig: ProviderConfig = {
  type: "gateway",
  customBaseUrl: "",
  customApiKey: "",
  customModel: "",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  anthropicApiKey: "",
  anthropicModel: "claude-sonnet-4-20250514",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gatewayUrl: "",
      gatewayToken: "",
      isConnected: false,
      setConnection: (url, token) => set({ gatewayUrl: url, gatewayToken: token }),
      setConnected: (v) => set({ isConnected: v }),

      providerConfig: defaultProviderConfig,
      setProviderConfig: (config) =>
        set((s) => ({ providerConfig: { ...s.providerConfig, ...config } })),

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
        providerConfig: state.providerConfig,
      }),
    },
  ),
);
