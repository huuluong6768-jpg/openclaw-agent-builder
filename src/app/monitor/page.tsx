"use client";

import { useRef, useState } from "react";
import { Activity, Pause, Play, Trash2 } from "lucide-react";
import { useAppStore, type MonitorEvent } from "@/stores/app-store";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const eventTypeColors: Record<MonitorEvent["type"], string> = {
  task_start: "var(--info)",
  task_complete: "var(--ok)",
  message: "var(--foreground)",
  error: "var(--danger)",
  thinking: "var(--warn)",
  tool_use: "var(--accent)",
};

const eventTypeLabels: Record<MonitorEvent["type"], string> = {
  task_start: "Bắt đầu",
  task_complete: "Hoàn thành",
  message: "Tin nhắn",
  error: "Lỗi",
  thinking: "Suy nghĩ",
  tool_use: "Tool",
};

export default function MonitorPage() {
  const { monitorEvents, addMonitorEvent, clearMonitorEvents, agents } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLive, setIsLive] = useState(false);

  const startLive = () => {
    if (intervalRef.current) return;
    setIsLive(true);
    const agentNames = agents.length > 0
      ? agents.map((a) => ({ id: a.id, name: a.identity?.name || a.name }))
      : [{ id: "master", name: "Agent Chúa" }, { id: "writer", name: "Writer" }];

    const sampleEvents: Omit<MonitorEvent, "id" | "timestamp">[] = [
      { agentId: agentNames[0].id, type: "thinking", content: "Phân tích yêu cầu từ người dùng..." },
      { agentId: agentNames[0].id, type: "task_start", content: "Khởi tạo task: Research AI Safety" },
      { agentId: agentNames.length > 1 ? agentNames[1].id : "master", type: "tool_use", content: "web-search: 'AI Safety 2025 trends'" },
      { agentId: agentNames[0].id, type: "message", content: "Đã tìm thấy 5 nguồn liên quan" },
      { agentId: agentNames[0].id, type: "task_complete", content: "Task hoàn thành: Research AI Safety" },
    ];

    let idx = 0;
    intervalRef.current = setInterval(() => {
      const sample = sampleEvents[idx % sampleEvents.length];
      addMonitorEvent({ id: generateId(), timestamp: Date.now(), ...sample });
      idx++;
    }, 3000);
  };

  const stopLive = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLive(false);
  };

  const getAgentInfo = (agentId: string) => {
    if (agentId === "master") return { name: "Agent Chúa", emoji: "👑" };
    const agent = agents.find((a) => a.id === agentId);
    return {
      name: agent?.identity?.name || agent?.name || agentId,
      emoji: agent?.identity?.emoji || agent?.emoji || "🤖",
    };
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Giám sát</h1>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--ok-subtle)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--ok)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)] animate-pulse-dot" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isLive ? (
            <button
              onClick={startLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--ok)] hover:border-[var(--ok)] cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              Demo Live
            </button>
          ) : (
            <button
              onClick={stopLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] cursor-pointer"
            >
              <Pause className="h-3.5 w-3.5" />
              Dừng
            </button>
          )}
          <button
            onClick={clearMonitorEvents}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer"
            title="Xóa log"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Event Stream */}
      <div
        ref={scrollRef}
        className="flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-y-auto font-mono text-xs"
      >
        {monitorEvents.length > 0 ? (
          <div className="p-3 space-y-1">
            {monitorEvents.map((event) => {
              const agentInfo = getAgentInfo(event.agentId);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-accent)] animate-message-in"
                >
                  <span className="text-[var(--muted)] shrink-0 w-16">
                    {new Date(event.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                    style={{
                      color: eventTypeColors[event.type],
                      backgroundColor: `color-mix(in srgb, ${eventTypeColors[event.type]} 10%, transparent)`,
                    }}
                  >
                    {eventTypeLabels[event.type]}
                  </span>
                  <span className="shrink-0">
                    {agentInfo.emoji}
                  </span>
                  <span className="font-semibold text-[var(--text-strong)] shrink-0">
                    {agentInfo.name}
                  </span>
                  <span className="text-[var(--foreground)] break-all">
                    {event.content}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Activity className="h-8 w-8 text-[var(--muted)] mb-2" />
            <p className="text-sm text-[var(--muted)]">
              Nhấn &ldquo;Demo Live&rdquo; để xem luồng sự kiện mẫu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
