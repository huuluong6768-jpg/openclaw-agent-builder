"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2, RefreshCw, Bot } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import * as api from "@/lib/api-client";

export default function AgentsPage() {
  const { agents, setAgents, gatewayUrl, gatewayToken, isConnected } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🤖");
  const [newModel, setNewModel] = useState("anthropic/claude-sonnet-4-20250514");
  const [newSoul, setNewSoul] = useState("");

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.fetchAgents();
      setAgents(result.agents);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [setAgents]);

  // Load on mount (via user interaction or initial render)
  const [initialized, setInitialized] = useState(false);
  if (!initialized && gatewayUrl && gatewayToken) {
    setInitialized(true);
    loadAgents();
  }

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const result = await api.createAgent({
        name: newName.trim(),
        workspace: `~/.openclaw/workspace-${newName.toLowerCase().replace(/\s+/g, "-")}`,
        model: newModel,
        emoji: newEmoji,
      });

      // Write SOUL.md if provided
      if (newSoul.trim() && result.agentId) {
        await api.setAgentFile(result.agentId, "SOUL.md", `# ${newName}\n\n${newSoul.trim()}`);
      }

      // Write AGENTS.md placeholder
      if (result.agentId) {
        await api.setAgentFile(
          result.agentId,
          "AGENTS.md",
          `# ${newName} Instructions\n\nChuyên gia AI sẵn sàng hỗ trợ.\n`,
        );
      }

      // Refresh list
      await loadAgents();
      setShowCreate(false);
      setNewName("");
      setNewSoul("");
    } catch {
      // Error handling
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Nhân viên AI</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Quản lý đội ngũ agents — mỗi agent là một nhân viên thực thụ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAgents}
            disabled={loading}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tạo agent mới
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Tạo nhân viên AI mới</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div>
                  <label className="text-xs text-[var(--muted)] mb-1 block">Emoji</label>
                  <input
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-14 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-center text-xl"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[var(--muted)] mb-1 block">Tên</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Vd: Minh Developer"
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Model</label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value="anthropic/claude-sonnet-4-20250514">Claude Sonnet 4</option>
                  <option value="anthropic/claude-opus-4-20250514">Claude Opus 4</option>
                  <option value="openai/gpt-4o">GPT-4o</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">SOUL.md (Persona)</label>
                <textarea
                  value={newSoul}
                  onChange={(e) => setNewSoul(e.target.value)}
                  placeholder="Mô tả persona, tính cách, chuyên môn của agent..."
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none font-mono"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-[var(--radius-sm)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--bg-accent)] cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
              >
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{agent.identity?.emoji || agent.emoji || "🤖"}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                    {agent.identity?.name || agent.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 font-mono truncate">
                    {agent.model?.primary || "—"}
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-[var(--ok)] mt-1" />
              </div>

              {/* Skills */}
              {agent.skills && agent.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                  {agent.skills.length > 4 && (
                    <span className="rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                      +{agent.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted)]">ID: {agent.id.slice(0, 8)}</span>
                <span className="text-[10px] text-[var(--accent)]">Xem chi tiết →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="h-12 w-12 text-[var(--muted)] mb-3" />
          <p className="text-sm text-[var(--muted)] mb-4">
            {isConnected
              ? "Chưa có agent nào. Tạo agent đầu tiên!"
              : "Kết nối Gateway trước để xem danh sách agents."}
          </p>
          {!isConnected && (
            <Link
              href="/settings"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Vào Cài đặt →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
