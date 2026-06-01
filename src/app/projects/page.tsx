"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ProjectsPage() {
  const { projects, addProject, agents } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [description, setDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const handleCreate = () => {
    if (!name.trim()) return;
    addProject({
      id: generateId(),
      name: name.trim(),
      emoji,
      description: description.trim(),
      teamAgentIds: selectedAgents,
      progress: 0,
      status: "active",
      createdAt: Date.now(),
    });
    setName("");
    setDescription("");
    setSelectedAgents([]);
    setShowCreate(false);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId],
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dự án</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Quản lý dự án và đội nhóm</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tạo dự án
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Tạo dự án mới</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-center text-lg"
                  maxLength={2}
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên dự án"
                  className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả dự án"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none"
                rows={3}
              />
              <div>
                <p className="text-xs font-medium text-[var(--muted)] mb-2">Đội nhóm:</p>
                <div className="flex flex-wrap gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs cursor-pointer ${
                        selectedAgents.includes(agent.id)
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <span>{agent.identity?.emoji || agent.emoji || "🤖"}</span>
                      {agent.identity?.name || agent.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-[var(--radius-sm)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--bg-accent)] cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="rounded-[var(--radius-sm)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] cursor-pointer"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{project.emoji}</span>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-strong)]">
                      {project.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-0.5">{project.description}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    project.status === "active"
                      ? "bg-[var(--ok-subtle)] text-[var(--ok)]"
                      : project.status === "paused"
                        ? "bg-[var(--warn-subtle)] text-[var(--warn)]"
                        : "bg-[var(--bg-accent)] text-[var(--muted)]"
                  }`}
                >
                  {project.status === "active" ? "Đang chạy" : project.status === "paused" ? "Tạm dừng" : "Hoàn thành"}
                </span>
              </div>

              {/* Team */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[var(--muted)]">Đội:</span>
                <div className="flex -space-x-1">
                  {project.teamAgentIds.slice(0, 5).map((agentId) => {
                    const agent = agents.find((a) => a.id === agentId);
                    return (
                      <span
                        key={agentId}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--card)] bg-[var(--bg-accent)] text-xs"
                        title={agent?.identity?.name || agent?.name}
                      >
                        {agent?.identity?.emoji || agent?.emoji || "🤖"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Tiến độ</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-accent)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderKanban className="h-12 w-12 text-[var(--muted)] mb-3" />
          <p className="text-sm text-[var(--muted)]">Chưa có dự án nào. Tạo dự án đầu tiên!</p>
        </div>
      )}
    </div>
  );
}
