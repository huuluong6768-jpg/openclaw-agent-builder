"use client";

import { useRef, useState } from "react";
import { Send, Paperclip, Mic, RefreshCw, Bot } from "lucide-react";
import { useAppStore, type ChatMessage } from "@/stores/app-store";
import * as api from "@/lib/api-client";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ChatPage() {
  const {
    chatMessages,
    currentChatAgent,
    setCurrentChatAgent,
    addChatMessage,
    agents,
    setAgents,
    gatewayUrl,
    gatewayToken,
    providerConfig,
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4");
  const [thinkingMode, setThinkingMode] = useState("off");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [agentsLoaded, setAgentsLoaded] = useState(false);
  if (!agentsLoaded && gatewayUrl && gatewayToken) {
    setAgentsLoaded(true);
    api.fetchAgents().then((r) => setAgents(r.agents)).catch(() => {});
  }

  const currentMessages = chatMessages[currentChatAgent] || [];
  const currentAgent = agents.find((a) => a.id === currentChatAgent);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      agentId: currentChatAgent,
    };
    addChatMessage(currentChatAgent, userMsg);
    setInputValue("");
    setIsTyping(true);

    try {
      const history = currentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      history.push({ role: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          gatewayUrl,
          gatewayToken,
          provider: providerConfig,
          agentId: currentChatAgent,
          model: selectedModel,
          thinking: thinkingMode === "on",
        }),
      });

      const data = await res.json();
      const aiContent = data.content ?? data.error ?? "Xin lỗi, có lỗi xảy ra.";

      addChatMessage(currentChatAgent, {
        id: generateId(),
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
        agentId: currentChatAgent,
        agentConfig: data.agentConfig,
        actions: data.agentConfig
          ? [
              { label: "Tạo Agent", action: "confirm" },
              { label: "Chỉnh sửa", action: "edit" },
            ]
          : undefined,
      });
    } catch {
      addChatMessage(currentChatAgent, {
        id: generateId(),
        role: "assistant",
        content: "Lỗi kết nối. Vui lòng kiểm tra cài đặt Gateway.",
        timestamp: Date.now(),
        agentId: currentChatAgent,
      });
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const contextUsed = currentMessages.length * 2;
  const contextPercent = Math.min(Math.round((contextUsed / 200) * 100), 100);

  return (
    <div className="flex h-full">
      {/* Agent Sidebar */}
      <div className="w-56 border-r border-[var(--border)] bg-[var(--background)] flex flex-col">
        <div className="p-3 border-b border-[var(--border)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Chọn Agent
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Master Agent always available */}
          <button
            onClick={() => setCurrentChatAgent("master")}
            className={`flex items-center gap-2 w-full rounded-[var(--radius-sm)] px-3 py-2 text-left transition-colors cursor-pointer ${
              currentChatAgent === "master"
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "text-[var(--foreground)] hover:bg-[var(--bg-accent)]"
            }`}
          >
            <span className="text-lg">👑</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Agent Chúa</p>
              <p className="text-[10px] text-[var(--muted)]">Orchestrator</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
          </button>

          {/* Real agents from gateway */}
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setCurrentChatAgent(agent.id)}
              className={`flex items-center gap-2 w-full rounded-[var(--radius-sm)] px-3 py-2 text-left transition-colors cursor-pointer ${
                currentChatAgent === agent.id
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:bg-[var(--bg-accent)]"
              }`}
            >
              <span className="text-lg">{agent.identity?.emoji || agent.emoji || "🤖"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {agent.identity?.name || agent.name}
                </p>
                <p className="text-[10px] text-[var(--muted)] truncate">
                  {agent.model?.primary?.split("/").pop() || "—"}
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
            </button>
          ))}

          {agents.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-[var(--muted)]">
                Kết nối Gateway để thấy danh sách agents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Toolbar */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-accent)] px-2 py-1 text-xs text-[var(--foreground)] cursor-pointer"
          >
            <option value="claude-sonnet-4">claude-sonnet-4</option>
            <option value="claude-opus-4">claude-opus-4</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
          </select>

          <select
            value={thinkingMode}
            onChange={(e) => setThinkingMode(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-accent)] px-2 py-1 text-xs text-[var(--foreground)] cursor-pointer"
          >
            <option value="off">Thinking: Off</option>
            <option value="on">Thinking: On</option>
          </select>

          <div className="flex-1" />

          <button
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-accent)] cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">
                {currentChatAgent === "master" ? "👑" : currentAgent?.identity?.emoji || "🤖"}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                {currentChatAgent === "master"
                  ? "Agent Chúa"
                  : currentAgent?.identity?.name || currentAgent?.name || "Agent"}
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-md">
                {currentChatAgent === "master"
                  ? "Xin chào! Tôi là Agent Chúa — quản lý đội ngũ AI. Bạn có thể tạo agent, giao việc, hoặc hỏi bất kỳ điều gì."
                  : `Bắt đầu trò chuyện với ${currentAgent?.identity?.name || currentAgent?.name || "agent"}.`}
              </p>
            </div>
          )}

          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex animate-message-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs mr-2 mt-1">
                  {currentChatAgent === "master" ? "👑" : (currentAgent?.identity?.emoji || "🤖")}
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${msg.role === "user" ? "text-white/70" : "text-[var(--muted)]"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-accent)] text-[var(--muted)] text-xs ml-2 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-2 animate-message-in">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs">
                {currentChatAgent === "master" ? "👑" : "🤖"}
              </div>
              <div className="rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] px-4 py-3">
                <div className="flex gap-1">
                  <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted)]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted)]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[var(--muted)]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Context Bar */}
        <div className="px-4 py-1">
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <div className="flex-1 h-1 rounded-full bg-[var(--bg-accent)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${contextPercent}%` }}
              />
            </div>
            <span>{contextPercent}% ngữ cảnh · {contextUsed}k / 200k</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Nhắn tin cho ${currentChatAgent === "master" ? "Agent Chúa" : currentAgent?.identity?.name || currentAgent?.name || "Agent"} (Enter để gửi)`}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
              rows={1}
            />
            <div className="flex items-center gap-1">
              <button className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer" title="Đính kèm">
                <Paperclip className="h-4 w-4" />
              </button>
              <button className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer" title="Nói chuyện">
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
