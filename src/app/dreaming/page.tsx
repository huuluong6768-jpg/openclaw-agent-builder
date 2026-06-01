"use client";

import { Brain, Sparkles, BookOpen } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export default function DreamingPage() {
  const { dreamingSessions, agents } = useAppStore();

  const getAgent = (agentId: string) => {
    if (agentId === "master") return { name: "Agent Chúa", emoji: "👑" };
    const agent = agents.find((a) => a.id === agentId);
    return {
      name: agent?.identity?.name || agent?.name || agentId,
      emoji: agent?.identity?.emoji || agent?.emoji || "🤖",
    };
  };

  const typeIcons = {
    consolidation: Brain,
    reflection: Sparkles,
    learning: BookOpen,
  };

  const typeLabels = {
    consolidation: "Tổng hợp",
    reflection: "Suy ngẫm",
    learning: "Học hỏi",
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dreaming</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Phiên học hỏi và tổng hợp kiến thức tự động của agents
        </p>
      </div>

      {/* Explanation Card */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-strong)]">Cơ chế Dreaming</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Agents tự động chạy phiên &ldquo;dreaming&rdquo; để:{" "}
              <strong>Tổng hợp</strong> (consolidation) — gom thông tin từ nhiều phiên chat,{" "}
              <strong>Suy ngẫm</strong> (reflection) — rút ra bài học từ tasks đã hoàn thành,{" "}
              <strong>Học hỏi</strong> (learning) — cập nhật MEMORY.md và SOUL.md.
              Kết quả được lưu vào memory agent cho các phiên sau.
            </p>
          </div>
        </div>
      </div>

      {/* Dreaming Sessions */}
      {dreamingSessions.length > 0 ? (
        <div className="space-y-3">
          {dreamingSessions.map((session) => {
            const agentInfo = getAgent(session.agentId);
            const Icon = typeIcons[session.type];
            return (
              <div
                key={session.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-subtle)]">
                    <Icon className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{agentInfo.emoji}</span>
                      <span className="text-sm font-medium text-[var(--text-strong)]">
                        {agentInfo.name}
                      </span>
                      <span className="rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                        {typeLabels[session.type]}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {new Date(session.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[var(--foreground)] mt-3">{session.summary}</p>

                {session.lessonsLearned.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Bài học
                    </p>
                    <ul className="space-y-1">
                      {session.lessonsLearned.map((lesson, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                          <span className="text-[var(--ok)] mt-0.5">•</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Brain className="h-12 w-12 text-[var(--muted)] mb-3" />
          <p className="text-sm text-[var(--muted)]">
            Chưa có phiên dreaming nào. Agents sẽ tự động dreaming sau khi hoàn thành tasks.
          </p>
        </div>
      )}
    </div>
  );
}
