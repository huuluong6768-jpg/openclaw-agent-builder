"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Globe, Eye, CheckCircle, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/app-store";
import { setAgentFile, getAgentFile, fetchAgents } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const targetFiles = [
  { id: "MEMORY.md", label: "MEMORY.md", description: "Long-term knowledge" },
  { id: "AGENTS.md", label: "AGENTS.md", description: "Agent instructions" },
  { id: "SOUL.md", label: "SOUL.md", description: "Persona & identity" },
  { id: "USER.md", label: "USER.md", description: "User preferences" },
];

const defaultAgentOptions = [
  { id: "marketing-writer", label: "✍️ Marketing Writer" },
  { id: "code-reviewer", label: "💻 Code Reviewer" },
  { id: "research-agent", label: "🔬 Research Agent" },
];

export default function KnowledgePage() {
  const { agents, isConnected, setAgents } = useAppStore();
  const [selectedAgent, setSelectedAgent] = useState("");
  const [targetFile, setTargetFile] = useState("MEMORY.md");
  const [textContent, setTextContent] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewContent, setPreviewContent] = useState("");
  const [injectMode, setInjectMode] = useState<"append" | "replace">("append");
  const [injecting, setInjecting] = useState(false);
  const [injectResult, setInjectResult] = useState<"success" | "error" | null>(null);
  const [existingContent, setExistingContent] = useState("");

  const agentOptions = agents.length > 0
    ? agents.map((a) => ({ id: a.id, label: `${a.emoji ?? "🤖"} ${a.name}` }))
    : defaultAgentOptions;

  useEffect(() => {
    if (agentOptions.length > 0 && !selectedAgent) {
      setSelectedAgent(agentOptions[0].id);
    }
  }, [agentOptions, selectedAgent]);

  useEffect(() => {
    if (isConnected) {
      fetchAgents().then((r) => setAgents(r.agents)).catch(() => {});
    }
  }, [isConnected, setAgents]);

  useEffect(() => {
    if (isConnected && selectedAgent && targetFile) {
      getAgentFile(selectedAgent, targetFile)
        .then((r) => setExistingContent(r.content ?? ""))
        .catch(() => setExistingContent(""));
    }
  }, [isConnected, selectedAgent, targetFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);

    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".txt", ".md", ".csv"],
      "application/pdf": [".pdf"],
      "application/json": [".json"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const handleInject = async () => {
    if (!selectedAgent || !previewContent) return;

    setInjecting(true);
    setInjectResult(null);

    try {
      let content: string;
      if (injectMode === "append" && existingContent) {
        content = existingContent + "\n\n" + previewContent;
      } else {
        content = previewContent;
      }

      await setAgentFile(selectedAgent, targetFile, content);
      setInjectResult("success");
      setExistingContent(content);
      setTextContent("");
      setPreviewContent("");
      setUploadedFiles([]);
    } catch {
      setInjectResult("error");
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Injection</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload files, paste text, or crawl URLs to add knowledge to your agents
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="space-y-6">
          {/* Agent Selector */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {agentOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Upload className="h-4 w-4" />
              Upload Files
            </h3>
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragActive
                  ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                  : "border-gray-300 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-600",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  or click to browse. PDF, DOCX, TXT, MD, CSV, JSON (max 10MB)
                </p>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)}KB</span>
                    <button
                      onClick={() => setUploadedFiles(uploadedFiles.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Paste */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <FileText className="h-4 w-4" />
              Paste Text
            </h3>
            <Textarea
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                setPreviewContent(e.target.value);
              }}
              placeholder="Paste or type knowledge content here..."
              className="min-h-[120px]"
            />
          </div>

          {/* URL Crawl */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Globe className="h-4 w-4" />
              Import from URL
            </h3>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/docs"
                className="flex-1"
              />
              <Button variant="outline">Crawl</Button>
            </div>
          </div>
        </div>

        {/* Right: Target & Preview */}
        <div className="space-y-6">
          {/* Target File */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Target File</h3>
            <div className="grid grid-cols-2 gap-2">
              {targetFiles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTargetFile(f.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors cursor-pointer",
                    targetFile === f.id
                      ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500",
                  )}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{f.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Inject Mode */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Inject Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setInjectMode("append")}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                  injectMode === "append"
                    ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-400",
                )}
              >
                Append
              </button>
              <button
                onClick={() => setInjectMode("replace")}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                  injectMode === "replace"
                    ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-400",
                )}
              >
                Replace
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Eye className="h-4 w-4" />
              Preview
            </h3>
            <div className="min-h-[200px] rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              {previewContent ? (
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 dark:text-gray-300">
                  {previewContent}
                </pre>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Upload a file, paste text, or crawl a URL to see the preview
                </p>
              )}
            </div>
          </div>

          {/* Inject Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleInject}
            disabled={injecting || !previewContent}
          >
            {injecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Injecting...
              </>
            ) : injectResult === "success" ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Injected successfully!
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Inject Knowledge into {targetFile}
              </>
            )}
          </Button>
          {injectResult === "error" && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              Failed to inject knowledge. Make sure you&apos;re connected to your OpenClaw server.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
