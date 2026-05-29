"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Code2,
  Globe,
  Key,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  agentId: string;
  createdAt: number;
  lastUsed: number | null;
};

const defaultAgentOptions = [
  { id: "marketing-writer", label: "✍️ Marketing Writer" },
  { id: "code-reviewer", label: "💻 Code Reviewer" },
  { id: "research-agent", label: "🔬 Research Agent" },
];

function generateApiKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "oc_";
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export default function IntegrationsPage() {
  const { agents } = useAppStore();
  const [selectedAgent, setSelectedAgent] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"share" | "api" | "embed" | "keys">("share");

  const agentOptions = agents.length > 0
    ? agents.map((a) => ({ id: a.id, label: `${a.emoji ?? "🤖"} ${a.name}` }))
    : defaultAgentOptions;

  useEffect(() => {
    if (agentOptions.length > 0 && !selectedAgent) {
      setSelectedAgent(agentOptions[0].id);
    }
  }, [agentOptions, selectedAgent]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const shareLink = `${baseUrl}/chat/${selectedAgent}`;
  const apiEndpoint = `${baseUrl}/api/gateway/agents`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    const key: ApiKey = {
      id: Date.now().toString(36),
      name: newKeyName.trim(),
      key: generateApiKey(),
      agentId: selectedAgent,
      createdAt: Date.now(),
      lastUsed: null,
    };
    setApiKeys((prev) => [...prev, key]);
    setNewKeyName("");
  };

  const deleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const embedCode = `<!-- OpenClaw Chat Widget -->
<script>
  window.OpenClawEmbed = {
    agentId: "${selectedAgent}",
    baseUrl: "${baseUrl}",
    position: "bottom-right",
    theme: "light",
    title: "Chat with AI",
    primaryColor: "#3b82f6",
    width: "380px",
    height: "520px"
  };
</script>
<script src="${baseUrl}/embed.js" defer></script>`;

  const curlExample = `curl -X POST ${baseUrl}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "agentId": "${selectedAgent}"
  }'`;

  const jsExample = `const response = await fetch("${baseUrl}/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }],
    agentId: "${selectedAgent}"
  })
});
const data = await response.json();
console.log(data.content);`;

  const pythonExample = `import requests

response = requests.post(
    "${baseUrl}/api/chat",
    json={
        "messages": [{"role": "user", "content": "Hello!"}],
        "agentId": "${selectedAgent}"
    }
)
print(response.json()["content"])`;

  const tabs = [
    { id: "share" as const, label: "Share Link", icon: Link2 },
    { id: "api" as const, label: "API Access", icon: Code2 },
    { id: "embed" as const, label: "Embed Widget", icon: Globe },
    { id: "keys" as const, label: "API Keys", icon: Key },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Integrations</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share your agents, embed them on websites, or access via API
        </p>
      </div>

      {/* Agent Selector */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Agent
        </label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="flex h-9 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {agentOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Share Link Tab */}
      {activeTab === "share" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Direct Chat Link
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Share this link so anyone can chat with your agent directly in the browser.
            </p>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareLink, "share-link")}
                className="shrink-0"
              >
                {copied === "share-link" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <a href={shareLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Share Preview</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                  AI
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedAgent.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">Powered by OpenClaw</p>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                Hi! I&apos;m ready to help. How can I assist you today?
              </div>
            </div>
          </section>
        </div>
      )}

      {/* API Access Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              API Endpoint
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Send messages to your agent programmatically. Compatible with OpenAI chat format.
            </p>
            <div className="flex gap-2 mb-4">
              <Badge>POST</Badge>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {baseUrl}/api/chat
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`${baseUrl}/api/chat`, "api-url")}
              >
                {copied === "api-url" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </section>

          {/* cURL */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">cURL</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(curlExample, "curl")}
              >
                {copied === "curl" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                <span className="ml-1 text-xs">Copy</span>
              </Button>
            </div>
            <pre className="rounded-lg bg-gray-900 p-4 text-xs font-mono text-green-400 overflow-x-auto">
              {curlExample}
            </pre>
          </section>

          {/* JavaScript */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">JavaScript / TypeScript</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(jsExample, "js")}
              >
                {copied === "js" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                <span className="ml-1 text-xs">Copy</span>
              </Button>
            </div>
            <pre className="rounded-lg bg-gray-900 p-4 text-xs font-mono text-blue-300 overflow-x-auto">
              {jsExample}
            </pre>
          </section>

          {/* Python */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Python</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(pythonExample, "python")}
              >
                {copied === "python" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                <span className="ml-1 text-xs">Copy</span>
              </Button>
            </div>
            <pre className="rounded-lg bg-gray-900 p-4 text-xs font-mono text-yellow-300 overflow-x-auto">
              {pythonExample}
            </pre>
          </section>
        </div>
      )}

      {/* Embed Widget Tab */}
      {activeTab === "embed" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              Embed Chat Widget
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Add a floating chat bubble to any website. Paste this code before the closing {`</body>`} tag.
            </p>
            <div className="relative">
              <pre className="rounded-lg bg-gray-900 p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                {embedCode}
              </pre>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(embedCode, "embed")}
              >
                {copied === "embed" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                <span className="ml-1 text-xs">Copy</span>
              </Button>
            </div>
          </section>

          {/* Customization */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Customization Options</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Position</label>
                <select className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Theme</label>
                <select className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Primary Color</label>
                <div className="flex gap-2">
                  <Input defaultValue="#3b82f6" className="font-mono text-xs" />
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-500 border border-gray-300" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Widget Size</label>
                <div className="flex gap-2">
                  <Input defaultValue="380px" placeholder="Width" className="text-xs" />
                  <Input defaultValue="520px" placeholder="Height" className="text-xs" />
                </div>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Widget Preview</h3>
            <div className="relative h-80 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-gray-400">Your website content</p>
              </div>
              {/* Mini chat widget preview */}
              <div className="absolute bottom-4 right-4 w-72 rounded-xl bg-white border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 bg-blue-600 px-4 py-2.5 text-white">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <span className="text-xs font-medium">Chat with AI</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="rounded-lg bg-gray-100 px-3 py-2 text-[11px] text-gray-700 dark:bg-gray-900 dark:text-gray-300 max-w-[80%]">
                    Hi! How can I help you?
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] text-white max-w-[80%]">
                      Tell me about your services
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-900 px-3 py-2 text-[10px] text-gray-400">
                    Type a message...
                  </div>
                </div>
              </div>
              {/* Float button */}
              <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 shadow-lg flex items-center justify-center" style={{ right: "300px" }}>
                <svg className="h-5 w-5 text-white" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              API Keys
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Create API keys to authenticate external applications accessing your agents.
            </p>

            {/* Create new key */}
            <div className="mb-6 flex gap-2">
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., My App, Production)"
                className="max-w-sm"
                onKeyDown={(e) => e.key === "Enter" && createApiKey()}
              />
              <Button onClick={createApiKey} disabled={!newKeyName.trim()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Key
              </Button>
            </div>

            {/* Keys list */}
            {apiKeys.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <Key className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No API keys yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Create a key to get started with the API</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.name}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {agentOptions.find((a) => a.id === apiKey.agentId)?.label ?? apiKey.agentId}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {showKeys[apiKey.id] ? apiKey.key : apiKey.key.slice(0, 7) + "•".repeat(20)}
                        </code>
                        <button
                          onClick={() => setShowKeys((prev) => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-gray-400">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()} •{" "}
                        {apiKey.lastUsed ? `Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}` : "Never used"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key, `key-${apiKey.id}`)}
                      >
                        {copied === `key-${apiKey.id}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
