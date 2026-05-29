import { useAppStore } from "@/stores/app-store";
import type { AgentSummary, ModelChoice } from "@/lib/openclaw-client";

function getHeaders(): HeadersInit {
  const { gatewayUrl, gatewayToken } = useAppStore.getState();
  return {
    "Content-Type": "application/json",
    "x-gateway-url": gatewayUrl,
    "x-gateway-token": gatewayToken,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

// Connection
export async function testConnection(url: string, token: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, token }),
  });
  return handleResponse(res);
}

// Agents
export async function fetchAgents(): Promise<{ agents: AgentSummary[] }> {
  const res = await fetch("/api/gateway/agents", { headers: getHeaders() });
  return handleResponse(res);
}

export async function createAgent(params: {
  name: string;
  workspace: string;
  model?: string;
  emoji?: string;
}): Promise<{ ok: boolean; agentId: string; name: string; workspace: string; model?: string }> {
  const res = await fetch("/api/gateway/agents", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function updateAgent(params: {
  agentId: string;
  name?: string;
  model?: string;
  emoji?: string;
}): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/agents", {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function deleteAgent(agentId: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/agents", {
    method: "DELETE",
    headers: getHeaders(),
    body: JSON.stringify({ agentId }),
  });
  return handleResponse(res);
}

// Agent Files
export async function getAgentFile(agentId: string, name: string): Promise<{ content: string }> {
  const params = new URLSearchParams({ agentId, name });
  const res = await fetch(`/api/gateway/agents/files?${params}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function setAgentFile(agentId: string, name: string, content: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/agents/files", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ agentId, name, content }),
  });
  return handleResponse(res);
}

// Models
export async function fetchModels(view = "all"): Promise<{ models: ModelChoice[] }> {
  const params = new URLSearchParams({ view });
  const res = await fetch(`/api/gateway/models?${params}`, { headers: getHeaders() });
  return handleResponse(res);
}

// Config
export async function fetchConfig(): Promise<{ config: Record<string, unknown>; baseHash: string }> {
  const res = await fetch("/api/gateway/config", { headers: getHeaders() });
  return handleResponse(res);
}

export async function setConfig(config: Record<string, unknown>, baseHash: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/config", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ config, baseHash }),
  });
  return handleResponse(res);
}

// Skills
export async function installSkill(slug: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/gateway/skills", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ slug }),
  });
  return handleResponse(res);
}
