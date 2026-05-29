"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Knowledge", "Config", "Chat"] as const;

type WorkspaceFile = { name: string; content: string };

const mockFiles: WorkspaceFile[] = [
  { name: "SOUL.md", content: "# Marketing Writer\n\nYou are a professional marketing content writer..." },
  { name: "AGENTS.md", content: "# Agent Instructions\n\n## Writing Guidelines\n- Be professional yet approachable..." },
  { name: "MEMORY.md", content: "# Knowledge Base\n\n## Brand Guidelines\n- Innovation, Trust, Quality..." },
  { name: "USER.md", content: "# User Preferences\n\n## Tone\n- Professional\n- Friendly" },
];

const thinkingLevels = ["off", "minimal", "low", "medium", "high", "max"];

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [name, setName] = useState("Marketing Writer");
  const [emoji, setEmoji] = useState("✍️");
  const [primaryModel, setPrimaryModel] = useState("anthropic/claude-sonnet-4-20250514");
  const [fallbacks, setFallbacks] = useState(["openai/gpt-5.5"]);
  const [thinking, setThinking] = useState("medium");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Agent ID: {id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Identity */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Identity
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</label>
                <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-20" />
              </div>
            </div>
          </section>

          {/* Model Configuration */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Model Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Model</label>
                <select
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  <optgroup label="Anthropic">
                    <option value="anthropic/claude-opus-4-20250514">anthropic/claude-opus-4-20250514</option>
                    <option value="anthropic/claude-sonnet-4-20250514">anthropic/claude-sonnet-4-20250514</option>
                  </optgroup>
                  <optgroup label="OpenAI">
                    <option value="openai/gpt-5.5">openai/gpt-5.5</option>
                    <option value="openai/gpt-4.1">openai/gpt-4.1</option>
                  </optgroup>
                  <optgroup label="Google">
                    <option value="google/gemini-2.5-pro">google/gemini-2.5-pro</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Context: 200K tokens | Reasoning: Yes
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fallback Models
                </label>
                <div className="flex flex-wrap gap-2">
                  {fallbacks.map((f, i) => (
                    <Badge key={f} variant="secondary" className="gap-1">
                      {i + 1}. {f}
                      <button
                        onClick={() => setFallbacks(fallbacks.filter((_, j) => j !== i))}
                        className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs">
                    + Add
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Thinking & Behavior */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Thinking & Behavior
            </h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Thinking Level</label>
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                {thinkingLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setThinking(level)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      thinking === level
                        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Workspace Files */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Workspace Files
            </h3>
            <div className="space-y-2">
              {mockFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📄</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setEditingFile(file.name);
                        setFileContent(file.content);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* File Editor Modal */}
          {editingFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingFile}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)}>
                    Close
                  </Button>
                </div>
                <Textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingFile(null)}>Cancel</Button>
                  <Button onClick={() => setEditingFile(null)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between">
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Agent
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {activeTab === "Knowledge" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Go to the <Link href={`/knowledge?agent=${id}`} className="text-blue-600 hover:underline dark:text-blue-400">Knowledge page</Link> to inject knowledge for this agent.
          </p>
        </div>
      )}

      {activeTab === "Config" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Raw Configuration
          </h3>
          <pre className="rounded-lg bg-gray-50 p-4 text-xs font-mono text-gray-700 overflow-auto dark:bg-gray-900 dark:text-gray-300">
{JSON.stringify({
  name,
  emoji,
  model: { primary: primaryModel, fallbacks },
  thinkingDefault: thinking,
  workspace: "~/.openclaw/workspace",
}, null, 2)}
          </pre>
        </div>
      )}

      {activeTab === "Chat" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chat sessions for this agent will be shown here.
          </p>
        </div>
      )}
    </div>
  );
}
