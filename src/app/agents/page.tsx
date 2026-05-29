"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/agents/agent-card";
import { useAppStore } from "@/stores/app-store";
import { fetchAgents } from "@/lib/api-client";
import type { AgentSummary } from "@/lib/openclaw-client";

const mockAgents: AgentSummary[] = [
  {
    id: "marketing-writer",
    name: "Marketing Writer",
    workspace: "~/.openclaw/workspace",
    emoji: "✍️",
    model: { primary: "anthropic/claude-sonnet-4-20250514", fallbacks: ["openai/gpt-5.5"] },
    skills: ["web-search"],
    identity: { name: "Marketing Writer", emoji: "✍️" },
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    workspace: "~/.openclaw/workspace",
    emoji: "💻",
    model: { primary: "openai/gpt-5.5", fallbacks: ["anthropic/claude-sonnet-4-20250514"] },
    skills: ["github"],
    identity: { name: "Code Reviewer", emoji: "💻" },
  },
  {
    id: "research-agent",
    name: "Research Agent",
    workspace: "~/.openclaw/workspace",
    emoji: "🔬",
    model: { primary: "google/gemini-2.5-pro" },
    skills: ["web-search", "memory"],
    identity: { name: "Research Agent", emoji: "🔬" },
  },
];

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { agents: storeAgents, setAgents, isConnected } = useAppStore();

  const loadAgents = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const result = await fetchAgents();
      setAgents(result.agents);
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, [isConnected, setAgents]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const agents = storeAgents.length > 0 ? storeAgents : mockAgents;
  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.model?.primary?.toLowerCase().includes(search.toLowerCase()),
  );

  const isUsingMock = storeAgents.length === 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Agents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
            {isUsingMock && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(demo data)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {isConnected && (
            <Button variant="outline" size="sm" onClick={loadAgents} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          )}
          <Link href="/">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No agents found</p>
        </div>
      )}
    </div>
  );
}
