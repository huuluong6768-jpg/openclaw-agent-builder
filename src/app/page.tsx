"use client";

import { useRef, useEffect, useState } from "react";
import { Bot, BookOpen, Settings2, Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { useAppStore, type ChatMessage as ChatMsg } from "@/stores/app-store";
import * as api from "@/lib/api-client";

const suggestions = [
  "Create a customer support agent with Claude",
  "Build a code review assistant using GPT-5.5",
  "Make a content writer with web search skill",
  "Create a research agent with high thinking",
];

const quickActions = [
  { icon: Bot, label: "New Agent", description: "Create an agent via chat" },
  { icon: BookOpen, label: "Inject Knowledge", description: "Upload files or paste text" },
  { icon: Settings2, label: "Edit Agent", description: "Modify existing agent config" },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ChatPage() {
  const {
    chatMessages,
    addChatMessage,
    isConnected,
    gatewayUrl,
    gatewayToken,
    providerConfig,
    setAgents,
  } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async (content: string) => {
    const userMsg: ChatMsg = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setIsTyping(true);

    try {
      const chatHistory = chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      chatHistory.push({ role: "user", content });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          gatewayUrl,
          gatewayToken,
          provider: providerConfig,
        }),
      });

      const data = await res.json();
      const aiContent = data.content ?? data.error ?? "Sorry, something went wrong.";
      const agentConfig = data.agentConfig;

      if (agentConfig) {
        setPendingConfig(agentConfig);
      }

      const aiMsg: ChatMsg = {
        id: generateId(),
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
        agentConfig: agentConfig
          ? {
              name: agentConfig.name as string,
              emoji: agentConfig.emoji as string,
              model: agentConfig.model as { primary?: string; fallbacks?: string[] },
              skills: agentConfig.skills as string[],
            }
          : undefined,
        actions: agentConfig
          ? [
              { label: "Create Agent", action: "confirm" },
              { label: "Edit Config", action: "edit" },
            ]
          : undefined,
      };

      addChatMessage(aiMsg);
    } catch {
      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your connection settings and try again.",
        timestamp: Date.now(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: string) => {
    if (action === "confirm" && pendingConfig) {
      const config = pendingConfig;
      setPendingConfig(null);

      const progressMsg: ChatMsg = {
        id: generateId(),
        role: "assistant",
        content: "Creating your agent...",
        timestamp: Date.now(),
        progress: [
          { label: "Checking available models", status: "loading" },
          { label: "Creating agent", status: "pending" },
          { label: "Writing SOUL.md (persona)", status: "pending" },
          { label: "Writing AGENTS.md (instructions)", status: "pending" },
          { label: "Configuring model & fallbacks", status: "pending" },
        ],
      };
      addChatMessage(progressMsg);

      try {
        // Step 1: Create the agent
        const createResult = await api.createAgent({
          name: config.name as string,
          workspace: "~/.openclaw/workspace",
          model: (config.model as { primary?: string })?.primary,
          emoji: config.emoji as string,
        });

        addChatMessage({
          id: generateId(),
          role: "assistant",
          content: "Creating your agent...",
          timestamp: Date.now(),
          progress: [
            { label: "Checking available models", status: "done" },
            { label: "Creating agent", status: "done" },
            { label: "Writing SOUL.md (persona)", status: "loading" },
            { label: "Writing AGENTS.md (instructions)", status: "pending" },
            { label: "Configuring model & fallbacks", status: "pending" },
          ],
        });

        const agentId = createResult.agentId;

        // Step 2: Write SOUL.md
        if (config.soul) {
          await api.setAgentFile(
            agentId,
            "SOUL.md",
            `# ${config.name}\n\n${config.soul}`,
          );
        }

        addChatMessage({
          id: generateId(),
          role: "assistant",
          content: "Creating your agent...",
          timestamp: Date.now(),
          progress: [
            { label: "Checking available models", status: "done" },
            { label: "Creating agent", status: "done" },
            { label: "Writing SOUL.md (persona)", status: "done" },
            { label: "Writing AGENTS.md (instructions)", status: "loading" },
            { label: "Configuring model & fallbacks", status: "pending" },
          ],
        });

        // Step 3: Write AGENTS.md
        if (config.instructions) {
          await api.setAgentFile(
            agentId,
            "AGENTS.md",
            `# ${config.name} Instructions\n\n${config.instructions}`,
          );
        }

        addChatMessage({
          id: generateId(),
          role: "assistant",
          content: "Creating your agent...",
          timestamp: Date.now(),
          progress: [
            { label: "Checking available models", status: "done" },
            { label: "Creating agent", status: "done" },
            { label: "Writing SOUL.md (persona)", status: "done" },
            { label: "Writing AGENTS.md (instructions)", status: "done" },
            { label: "Configuring model & fallbacks", status: "done" },
          ],
        });

        // Refresh agents list
        try {
          const agentsResult = await api.fetchAgents();
          setAgents(agentsResult.agents);
        } catch {
          // Non-critical
        }

        addChatMessage({
          id: generateId(),
          role: "assistant",
          content: `Agent "${config.name}" created successfully! (ID: ${agentId})\n\nYou can now:\n- View it on the **Agents** page\n- Add knowledge on the **Knowledge** page\n- Chat with it directly from OpenClaw`,
          timestamp: Date.now(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addChatMessage({
          id: generateId(),
          role: "assistant",
          content: `Failed to create agent: ${message}\n\nMake sure you're connected to your OpenClaw server in **Settings**.`,
          timestamp: Date.now(),
        });
      }
    } else if (action === "edit") {
      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: "What would you like to change? You can modify:\n- Agent name\n- AI model (e.g., switch to GPT-5.5)\n- Skills (add web-search, github, etc.)\n- Thinking level (low/medium/high)\n- Persona description",
        timestamp: Date.now(),
      });
    }
  };

  const isEmpty = chatMessages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              How can I help you build your agent?
            </h2>
            <p className="mb-8 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
              Describe the agent you want to create, and I&apos;ll help configure everything for your OpenClaw server.
            </p>

            <div className="mb-8 flex gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() =>
                    handleSend(
                      action.label === "New Agent"
                        ? "I want to create a new agent"
                        : action.label === "Inject Knowledge"
                          ? "I want to inject knowledge into an agent"
                          : "I want to edit an existing agent",
                    )
                  }
                  className="flex w-40 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 cursor-pointer"
                >
                  <action.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{action.description}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            {!isConnected && gatewayUrl === "" && (
              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                Connect to your OpenClaw server first in{" "}
                <a href="/settings" className="font-medium underline">Settings</a>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {chatMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onAction={handleAction} />
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-message-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
