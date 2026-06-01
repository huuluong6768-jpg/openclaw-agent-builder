type RPCResponse = {
  type: "res";
  id: string;
  ok: boolean;
  result?: unknown;
  error?: { message: string; code?: number };
};

type RPCEvent = {
  type: "ev";
  method: string;
  params?: unknown;
};

type WSMessage = RPCResponse | RPCEvent | { type: string; [key: string]: unknown };

export type ModelChoice = {
  id: string;
  name: string;
  provider: string;
  alias?: string;
  contextWindow?: number;
  reasoning?: boolean;
};

export type AgentSummary = {
  id: string;
  name: string;
  workspace: string;
  emoji?: string;
  avatar?: string;
  model?: {
    primary?: string;
    fallbacks?: string[];
  };
  agentRuntime?: {
    id: string;
    fallback?: "openclaw" | "none";
    source: "env" | "agent" | "defaults" | "model" | "provider" | "implicit";
  };
  identity?: {
    name?: string;
    emoji?: string;
    avatar?: string;
    theme?: string;
  };
  skills?: string[];
};

export type AgentFile = {
  name: string;
  content: string;
};

export class OpenClawClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private requestId = 0;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private eventHandlers = new Map<string, ((params: unknown) => void)[]>();
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        this.rpc("connect", {
          minProtocol: 3,
          maxProtocol: 4,
          client: { id: "agent-builder", version: "1.0.0", platform: "web", mode: "operator" },
          role: "operator",
          scopes: ["operator.read", "operator.write"],
          auth: { token: this.token },
        })
          .then(() => {
            this.connected = true;
            resolve();
          })
          .catch(reject);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string) as WSMessage;
        if (msg.type === "res") {
          const r = msg as RPCResponse;
          const p = this.pending.get(r.id);
          if (p) {
            this.pending.delete(r.id);
            if (r.ok) {
              p.resolve(r.result);
            } else {
              p.reject(new Error(r.error?.message ?? "RPC error"));
            }
          }
        } else if (msg.type === "ev") {
          const ev = msg as RPCEvent;
          const handlers = this.eventHandlers.get(ev.method);
          if (handlers) {
            for (const h of handlers) h(ev.params);
          }
        }
      };

      ws.onerror = () => {
        reject(new Error("WebSocket error"));
      };

      ws.onclose = () => {
        this.connected = false;
        this.connectPromise = null;
      };
    });

    return this.connectPromise;
  }

  private async rpc(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected");
    }

    const id = String(++this.requestId);
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ type: "req", id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`RPC timeout: ${method}`));
        }
      }, 30000);
    });
  }

  on(event: string, handler: (params: unknown) => void) {
    const handlers = this.eventHandlers.get(event) ?? [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  async listModels(view: "default" | "configured" | "all" = "all"): Promise<{ models: ModelChoice[] }> {
    return (await this.rpc("models.list", { view })) as { models: ModelChoice[] };
  }

  async listAgents(): Promise<AgentSummary[]> {
    const result = (await this.rpc("agents.list", {})) as { agents: AgentSummary[] };
    return result.agents;
  }

  async createAgent(params: {
    name: string;
    workspace: string;
    model?: string;
    emoji?: string;
    avatar?: string;
  }): Promise<{ ok: boolean; agentId: string; name: string; workspace: string; model?: string }> {
    return (await this.rpc("agents.create", params)) as {
      ok: boolean;
      agentId: string;
      name: string;
      workspace: string;
      model?: string;
    };
  }

  async updateAgent(params: {
    agentId: string;
    name?: string;
    workspace?: string;
    model?: string;
    emoji?: string;
    avatar?: string;
  }): Promise<{ ok: boolean }> {
    return (await this.rpc("agents.update", params)) as { ok: boolean };
  }

  async deleteAgent(agentId: string, deleteFiles = false): Promise<{ ok: boolean }> {
    return (await this.rpc("agents.delete", { agentId, deleteFiles })) as { ok: boolean };
  }

  async getAgentFile(agentId: string, name: string): Promise<{ content: string }> {
    return (await this.rpc("agents.files.get", { agentId, name })) as { content: string };
  }

  async setAgentFile(agentId: string, name: string, content: string): Promise<{ ok: boolean }> {
    return (await this.rpc("agents.files.set", { agentId, name, content })) as { ok: boolean };
  }

  async listAgentFiles(agentId: string): Promise<{ files: AgentFile[] }> {
    return (await this.rpc("agents.files.list", { agentId })) as { files: AgentFile[] };
  }

  async getConfig(): Promise<{ config: Record<string, unknown>; baseHash: string }> {
    return (await this.rpc("config.get", {})) as { config: Record<string, unknown>; baseHash: string };
  }

  async setConfig(config: Record<string, unknown>, baseHash: string): Promise<{ ok: boolean }> {
    return (await this.rpc("config.set", { config, baseHash })) as { ok: boolean };
  }

  async installSkill(slug: string): Promise<{ ok: boolean }> {
    return (await this.rpc("skills.install", { source: "clawhub", slug })) as { ok: boolean };
  }

  async searchSkills(query: string): Promise<unknown> {
    return await this.rpc("skills.search", { query });
  }
}
