"use client";

import { useState } from "react";
import { Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useAppStore, type Task } from "@/stores/app-store";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const columns: { status: Task["status"]; label: string; color: string; icon: React.ElementType }[] = [
  { status: "queued", label: "Chờ xử lý", color: "var(--warn)", icon: Clock },
  { status: "running", label: "Đang chạy", color: "var(--info)", icon: Loader2 },
  { status: "completed", label: "Hoàn thành", color: "var(--ok)", icon: CheckCircle2 },
];

export default function TasksPage() {
  const { tasks, addTask, updateTask, agents } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAgentId, setNewAgentId] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addTask({
      id: generateId(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      agentId: newAgentId || "master",
      status: "queued",
      progress: 0,
      createdAt: Date.now(),
    });
    setNewTitle("");
    setNewDescription("");
    setNewAgentId("");
    setShowCreate(false);
  };

  /* eslint-disable react-hooks/purity */
  const handleStart = (taskId: string) => {
    updateTask(taskId, { status: "running", startedAt: Date.now() });
  };

  const handleComplete = (taskId: string) => {
    updateTask(taskId, { status: "completed", completedAt: Date.now(), progress: 100 });
  };
  /* eslint-enable react-hooks/purity */

  const getAgent = (agentId: string) =>
    agents.find((a) => a.id === agentId);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Công việc</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Bảng Kanban theo dõi tiến trình</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm việc
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Tạo công việc mới</h3>
            <div className="space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề công việc"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Mô tả (tùy chọn)"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none"
                rows={3}
              />
              <select
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="">Chọn agent phụ trách</option>
                <option value="master">👑 Agent Chúa</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.identity?.emoji || a.emoji || "🤖"} {a.identity?.name || a.name}
                  </option>
                ))}
              </select>
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

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col min-h-0">
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold text-[var(--text-strong)] uppercase">
                  {col.label} ({colTasks.length})
                </h3>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {colTasks.map((task) => {
                  const agent = getAgent(task.agentId);
                  return (
                    <div
                      key={task.id}
                      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 hover:border-[var(--accent)] transition-colors"
                    >
                      <p className="text-sm font-medium text-[var(--text-strong)]">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <span>{agent?.identity?.emoji || agent?.emoji || "👑"}</span>
                          <span>{agent?.identity?.name || agent?.name || "Agent Chúa"}</span>
                        </div>
                        {task.status === "running" && (
                          <span className="text-[10px] text-[var(--info)] font-mono">
                            {task.progress}%
                          </span>
                        )}
                        {task.status === "completed" && task.rating && (
                          <span className="text-[10px] text-[var(--warn)]">
                            {"★".repeat(task.rating)}
                          </span>
                        )}
                      </div>
                      {task.status === "running" && (
                        <div className="mt-2 h-1 rounded-full bg-[var(--bg-accent)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--info)] transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      )}
                      {/* Action buttons */}
                      <div className="flex gap-1 mt-2">
                        {task.status === "queued" && (
                          <button
                            onClick={() => handleStart(task.id)}
                            className="text-[10px] text-[var(--info)] hover:underline cursor-pointer"
                          >
                            Bắt đầu
                          </button>
                        )}
                        {task.status === "running" && (
                          <button
                            onClick={() => handleComplete(task.id)}
                            className="text-[10px] text-[var(--ok)] hover:underline cursor-pointer"
                          >
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-xs text-[var(--muted)]">
                    Trống
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
