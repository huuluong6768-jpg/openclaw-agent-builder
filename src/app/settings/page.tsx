"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { useTheme } from "next-themes";
import { testConnection } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { gatewayUrl, gatewayToken, isConnected, setConnection, setConnected } = useAppStore();
  const [url, setUrl] = useState(gatewayUrl || "ws://localhost:18789");
  const [token, setToken] = useState(gatewayToken);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState("");
  const [provider, setProvider] = useState("gateway");
  const [defaultModel, setDefaultModel] = useState("anthropic/claude-sonnet-4-20250514");
  const [defaultThinking, setDefaultThinking] = useState("medium");
  const [defaultWorkspace, setDefaultWorkspace] = useState("~/.openclaw/workspace");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError("");

    try {
      const result = await testConnection(url, token);
      if (result.ok) {
        setTestResult("success");
        setConnection(url, token);
        setConnected(true);
      } else {
        setTestResult("error");
        setTestError("Connection test failed");
      }
    } catch (err) {
      setTestResult("error");
      setTestError(err instanceof Error ? err.message : "Connection failed");
      setConnected(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your OpenClaw connection and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Connection */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            OpenClaw Connection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gateway URL
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ws://localhost:18789"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Token
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your gateway token"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              {testResult === "success" && (
                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" /> Connected successfully!
                </span>
              )}
              {testResult === "error" && (
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" /> {testError || "Connection failed"}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* AI Chat Engine */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            AI Chat Engine
          </h3>
          <div className="space-y-3">
            {[
              { id: "gateway", label: "Use OpenClaw Gateway", desc: "Route chat through your OpenClaw server" },
              { id: "openai", label: "Direct API (OpenAI)", desc: "Requires OPENAI_API_KEY env variable" },
              { id: "anthropic", label: "Direct API (Anthropic)", desc: "Requires ANTHROPIC_API_KEY env variable" },
            ].map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                  provider === option.id
                    ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500",
                )}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={provider === option.id}
                  onChange={() => setProvider(option.id)}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Default Agent Settings */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Default Agent Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Model
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="anthropic/claude-sonnet-4-20250514">anthropic/claude-sonnet-4-20250514</option>
                <option value="anthropic/claude-opus-4-20250514">anthropic/claude-opus-4-20250514</option>
                <option value="openai/gpt-5.5">openai/gpt-5.5</option>
                <option value="openai/gpt-4.1">openai/gpt-4.1</option>
                <option value="google/gemini-2.5-pro">google/gemini-2.5-pro</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Thinking Level
              </label>
              <select
                value={defaultThinking}
                onChange={(e) => setDefaultThinking(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {["off", "minimal", "low", "medium", "high", "max"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Workspace
              </label>
              <Input
                value={defaultWorkspace}
                onChange={(e) => setDefaultWorkspace(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Theme
          </h3>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={mounted && theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            About
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            OpenClaw Agent Builder v0.1.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Build and manage AI agents for your OpenClaw server
          </p>
        </section>
      </div>
    </div>
  );
}
