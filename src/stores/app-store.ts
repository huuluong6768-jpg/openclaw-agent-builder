"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentSummary, ModelChoice } from "@/lib/openclaw-client";

export type ViewMode = "simple" | "advanced";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  agentId?: string;
  agentConfig?: Partial<AgentSummary>;
  progress?: { label: string; status: "done" | "loading" | "pending" }[];
  actions?: { label: string; action: string }[];
};

export type ProviderType = "gateway" | "openai" | "anthropic" | "custom";

export type ProviderConfig = {
  type: ProviderType;
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  openaiApiKey: string;
  openaiModel: string;
  anthropicApiKey: string;
  anthropicModel: string;
};

export type Project = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  teamAgentIds: string[];
  progress: number;
  status: "active" | "paused" | "completed";
  createdAt: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  agentId: string;
  projectId?: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  rating?: number;
  createdAt: number;
  completedAt?: number;
  startedAt?: number;
};

export type MonitorEvent = {
  id: string;
  agentId: string;
  type: "task_start" | "task_complete" | "message" | "error" | "thinking" | "tool_use";
  content: string;
  timestamp: number;
};

export type DreamingSession = {
  id: string;
  agentId: string;
  type: "consolidation" | "reflection" | "learning";
  summary: string;
  lessonsLearned: string[];
  timestamp: number;
};

type AppState = {
  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

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

  // Chat - multi-agent
  chatMessages: Record<string, ChatMessage[]>;
  currentChatAgent: string;
  setCurrentChatAgent: (agentId: string) => void;
  addChatMessage: (agentId: string, msg: ChatMessage) => void;
  clearChat: (agentId?: string) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Monitor
  monitorEvents: MonitorEvent[];
  addMonitorEvent: (event: MonitorEvent) => void;
  clearMonitorEvents: () => void;

  // Dreaming
  dreamingSessions: DreamingSession[];
  addDreamingSession: (session: DreamingSession) => void;

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
      viewMode: "simple",
      setViewMode: (mode) => set({ viewMode: mode }),

      gatewayUrl: "wss://openclaw.vnsi.app",
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

      // Multi-agent chat
      chatMessages: {},
      currentChatAgent: "master",
      setCurrentChatAgent: (agentId) => set({ currentChatAgent: agentId }),
      addChatMessage: (agentId, msg) =>
        set((s) => ({
          chatMessages: {
            ...s.chatMessages,
            [agentId]: [...(s.chatMessages[agentId] || []), msg],
          },
        })),
      clearChat: (agentId) =>
        set((s) => {
          if (agentId) {
            const updated = { ...s.chatMessages };
            delete updated[agentId];
            return { chatMessages: updated };
          }
          return { chatMessages: {} };
        }),

      // Projects
      projects: [],
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // Monitor
      monitorEvents: [],
      addMonitorEvent: (event) =>
        set((s) => ({ monitorEvents: [event, ...s.monitorEvents].slice(0, 200) })),
      clearMonitorEvents: () => set({ monitorEvents: [] }),

      // Dreaming
      dreamingSessions: [],
      addDreamingSession: (session) =>
        set((s) => ({ dreamingSessions: [session, ...s.dreamingSessions] })),

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
        viewMode: state.viewMode,
        projects: state.projects,
        tasks: state.tasks,
        chatMessages: state.chatMessages,
        currentChatAgent: state.currentChatAgent,
      }),
    },
  ),
);
