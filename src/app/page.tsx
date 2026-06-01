"use client";

import { useState } from "react";
import { Bot, Activity, ListChecks, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/stores/app-store";
import * as api from "@/lib/api-client";

export default function DashboardPage() {
  const { agents, setAgents, tasks, isConnected, gatewayUrl, gatewayToken } = useAppStore();

  const [loaded, setLoaded] = useState(false);
  if (!loaded && (gatewayUrl && gatewayToken)) {
    setLoaded(true);
    api.fetchAgents().then((r) => setAgents(r.agents)).catch(() => {});
  }

  const runningTasks = tasks.filter((t) => t.status === "running");
  const todayStart = useState(() => Date.now() - 86400000)[0];
  const todayTasks = tasks.filter((t) => t.createdAt > todayStart);

  const stats = [
    { label: "Nhân viên AI", value: agents.length || "—", icon: Bot, color: "var(--accent)" },
    { label: "Đang hoạt động", value: runningTasks.length, icon: Activity, color: "var(--ok)" },
    { label: "Công việc hôm nay", value: todayTasks.length, icon: ListChecks, color: "var(--info)" },
    { label: "Đánh giá TB", value: "—", icon: Star, color: "var(--warn)" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Tổng quan</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Quản lý đội ngũ nhân viên AI của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">{stat.label}</span>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <div className="mt-2 text-2xl font-bold text-[var(--text-strong)]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--warn)] bg-[var(--warn-subtle)] p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[var(--warn)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-strong)]">
                Chưa kết nối OpenClaw Gateway
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Vào <Link href="/settings" className="text-[var(--accent)] underline">Cài đặt</Link> để nhập Gateway URL và token.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Team */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">Đội ngũ</h2>
          <Link
            href="/agents"
            className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
          >
            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.slice(0, 6).map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3 hover:border-[var(--accent)] hover:bg-[var(--bg-accent)] transition-colors"
              >
                <span className="text-2xl">{agent.identity?.emoji || agent.emoji || "🤖"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-strong)] truncate">
                    {agent.identity?.name || agent.name}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {agent.model?.primary || "—"}
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto text-[var(--muted)] mb-3" />
            <p className="text-sm text-[var(--muted)]">
              {isConnected
                ? "Chưa có agent nào. Tạo agent đầu tiên từ Chat."
                : "Kết nối Gateway để xem đội ngũ."}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-subtle)]">
            <Bot className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-strong)]">Chat với Agent Chúa</p>
            <p className="text-xs text-[var(--muted)]">Tạo agent, giao việc</p>
          </div>
        </Link>

        <Link
          href="/tasks"
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--ok-subtle)]">
            <ListChecks className="h-5 w-5 text-[var(--ok)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-strong)]">Công việc</p>
            <p className="text-xs text-[var(--muted)]">Kanban board</p>
          </div>
        </Link>

        <Link
          href="/agents"
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--info)] bg-opacity-10">
            <Star className="h-5 w-5 text-[var(--info)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-strong)]">Nhân viên AI</p>
            <p className="text-xs text-[var(--muted)]">Quản lý đội ngũ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
