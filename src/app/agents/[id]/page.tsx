"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import * as api from "@/lib/api-client";

const EDITABLE_FILES = [
  { name: "SOUL.md", label: "SOUL.md (Persona)" },
  { name: "AGENTS.md", label: "AGENTS.md (Instructions)" },
  { name: "MEMORY.md", label: "MEMORY.md (Knowledge)" },
];

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const { agents } = useAppStore();

  const [activeFile, setActiveFile] = useState("SOUL.md");
  const [fileContent, setFileContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const agent = agents.find((a) => a.id === agentId);

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      const contents: Record<string, string> = {};
      for (const file of EDITABLE_FILES) {
        try {
          const result = await api.getAgentFile(agentId, file.name);
          contents[file.name] = result.content || "";
        } catch {
          contents[file.name] = "";
        }
      }
      setFileContent(contents);
      setLoading(false);
    };
    loadFiles();
  }, [agentId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await api.setAgentFile(agentId, activeFile, fileContent[activeFile] || "");
      setSaveStatus("Đã lưu!");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] px-6 py-4">
        <Link
          href="/agents"
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-accent)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{agent?.identity?.emoji || agent?.emoji || "🤖"}</span>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-strong)]">
              {agent?.identity?.name || agent?.name || agentId}
            </h1>
            <p className="text-xs text-[var(--muted)] font-mono">
              {agent?.model?.primary || "—"} · ID: {agentId.slice(0, 12)}
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs text-[var(--ok)]">{saveStatus}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Lưu
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* File Tabs */}
        <div className="w-48 border-r border-[var(--border)] bg-[var(--background)] p-3 space-y-1">
          {EDITABLE_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={`w-full text-left rounded-[var(--radius-sm)] px-3 py-2 text-sm cursor-pointer ${
                activeFile === file.name
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-accent)]"
              }`}
            >
              {file.label}
            </button>
          ))}

          {/* Agent Info */}
          <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Skills</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(agent?.skills || []).map((s) => (
                  <span key={s} className="rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                    {s}
                  </span>
                ))}
                {(!agent?.skills || agent.skills.length === 0) && (
                  <span className="text-[10px] text-[var(--muted)]">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-[var(--muted)] animate-spin" />
            </div>
          ) : (
            <textarea
              value={fileContent[activeFile] || ""}
              onChange={(e) =>
                setFileContent((prev) => ({ ...prev, [activeFile]: e.target.value }))
              }
              className="flex-1 w-full resize-none bg-[var(--card)] text-sm text-[var(--foreground)] font-mono p-4 focus:outline-none leading-relaxed"
              placeholder={`Nhập nội dung ${activeFile}...`}
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
