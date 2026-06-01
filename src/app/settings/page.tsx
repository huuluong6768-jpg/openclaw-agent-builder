"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import type { ProviderType } from "@/stores/app-store";
import { useTheme } from "next-themes";
import { testConnection } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    gatewayUrl,
    gatewayToken,
    isConnected,
    setConnection,
    setConnected,
    providerConfig,
    setProviderConfig,
  } = useAppStore();

  const [url, setUrl] = useState(gatewayUrl || "ws://localhost:18789");
  const [token, setToken] = useState(gatewayToken);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState("");

  // Provider state
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(providerConfig.type);
  const [customBaseUrl, setCustomBaseUrl] = useState(providerConfig.customBaseUrl);
  const [customApiKey, setCustomApiKey] = useState(providerConfig.customApiKey);
  const [customModel, setCustomModel] = useState(providerConfig.customModel);
  const [openaiApiKey, setOpenaiApiKey] = useState(providerConfig.openaiApiKey);
  const [openaiModel, setOpenaiModel] = useState(providerConfig.openaiModel);
  const [anthropicApiKey, setAnthropicApiKey] = useState(providerConfig.anthropicApiKey);
  const [anthropicModel, setAnthropicModel] = useState(providerConfig.anthropicModel);

  // Visibility toggles
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);

  // Test chat state
  const [chatTesting, setChatTesting] = useState(false);
  const [chatTestResult, setChatTestResult] = useState<"success" | "error" | null>(null);
  const [chatTestError, setChatTestError] = useState("");

  // Saved state
  const [saved, setSaved] = useState(false);

  const [defaultModel, setDefaultModel] = useState("anthropic/claude-sonnet-4-20250514");
  const [defaultThinking, setDefaultThinking] = useState("medium");
  const [defaultWorkspace, setDefaultWorkspace] = useState("~/.openclaw/workspace");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  const handleSaveProvider = () => {
    setProviderConfig({
      type: selectedProvider,
      customBaseUrl,
      customApiKey,
      customModel,
      openaiApiKey,
      openaiModel,
      anthropicApiKey,
      anthropicModel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestChat = async () => {
    setChatTesting(true);
    setChatTestResult(null);
    setChatTestError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello, are you working?" }],
          gatewayUrl: url,
          gatewayToken: token,
          provider: {
            type: selectedProvider,
            customBaseUrl,
            customApiKey,
            customModel,
            openaiApiKey,
            openaiModel,
            anthropicApiKey,
            anthropicModel,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.content && !data.error) {
          setChatTestResult("success");
        } else {
          setChatTestResult("error");
          setChatTestError(data.error || "Empty response");
        }
      } else {
        const data = await res.json().catch(() => null);
        setChatTestResult("error");
        setChatTestError(data?.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setChatTestResult("error");
      setChatTestError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setChatTesting(false);
    }
  };

  const providerOptions = [
    {
      id: "gateway" as const,
      label: "OpenClaw Gateway",
      desc: "Route through your OpenClaw server (uses Gateway URL above)",
    },
    {
      id: "openai" as const,
      label: "OpenAI",
      desc: "Direct API to OpenAI (GPT-4o, GPT-4o-mini, etc.)",
    },
    {
      id: "anthropic" as const,
      label: "Anthropic",
      desc: "Direct API to Anthropic (Claude Sonnet, Opus, etc.)",
    },
    {
      id: "custom" as const,
      label: "Custom Provider (OpenAI-compatible)",
      desc: "Any OpenAI-compatible API: Ollama, LM Studio, OpenRouter, Together, Groq, etc.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your OpenClaw connection and AI provider
        </p>
      </div>

      <div className="space-y-6">
        {/* Connection */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
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
                  <CheckCircle className="h-4 w-4" /> Connected!
                </span>
              )}
              {testResult === "error" && (
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" /> {testError || "Failed"}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* AI Chat Engine / Provider */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            AI Chat Engine
          </h3>
          <div className="space-y-4">
            {/* Provider selector */}
            <div className="space-y-3">
              {providerOptions.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    selectedProvider === option.id
                      ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500",
                  )}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={selectedProvider === option.id}
                    onChange={() => setSelectedProvider(option.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* OpenAI config */}
            {selectedProvider === "openai" && (
              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  OpenAI Configuration
                </h4>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showOpenaiKey ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    >
                      {showOpenaiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Model
                  </label>
                  <select
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4.1">gpt-4.1</option>
                    <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                    <option value="o3">o3</option>
                    <option value="o3-mini">o3-mini</option>
                    <option value="o4-mini">o4-mini</option>
                  </select>
                </div>
              </div>
            )}

            {/* Anthropic config */}
            {selectedProvider === "anthropic" && (
              <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/10">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Anthropic Configuration
                </h4>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showAnthropicKey ? "text" : "password"}
                      value={anthropicApiKey}
                      onChange={(e) => setAnthropicApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    >
                      {showAnthropicKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Model
                  </label>
                  <select
                    value={anthropicModel}
                    onChange={(e) => setAnthropicModel(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-opus-4-20250514">Claude Opus 4</option>
                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom provider config */}
            {selectedProvider === "custom" && (
              <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Custom Provider Configuration
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Works with any OpenAI-compatible API: Ollama, LM Studio, OpenRouter, Together AI,
                  Groq, DeepInfra, Fireworks, etc.
                </p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Base URL
                  </label>
                  <Input
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434/v1 or https://openrouter.ai/api/v1"
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Examples: Ollama: http://localhost:11434/v1 | LM Studio: http://localhost:1234/v1
                    | OpenRouter: https://openrouter.ai/api/v1
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showCustomKey ? "text" : "password"}
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="API key (use 'ollama' for Ollama)"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCustomKey(!showCustomKey)}
                    >
                      {showCustomKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Model Name
                  </label>
                  <Input
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="llama3.1, mistral, deepseek-r1, etc."
                  />
                </div>
              </div>
            )}

            {/* Save + Test buttons */}
            <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Button onClick={handleSaveProvider} variant="default">
                <Save className="mr-2 h-4 w-4" />
                {saved ? "Saved!" : "Save Provider"}
              </Button>
              <Button onClick={handleTestChat} disabled={chatTesting} variant="outline">
                {chatTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Chat...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Test Chat
                  </>
                )}
              </Button>
              {chatTestResult === "success" && (
                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" /> AI responded!
                </span>
              )}
              {chatTestResult === "error" && (
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" /> {chatTestError || "Failed"}
                </span>
              )}
            </div>
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
                <option value="anthropic/claude-sonnet-4-20250514">
                  anthropic/claude-sonnet-4-20250514
                </option>
                <option value="anthropic/claude-opus-4-20250514">
                  anthropic/claude-opus-4-20250514
                </option>
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
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Workspace
              </label>
              <Input value={defaultWorkspace} onChange={(e) => setDefaultWorkspace(e.target.value)} />
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
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Built with Next.js + TypeScript + Tailwind CSS
          </p>
        </section>
      </div>
    </div>
  );
}
