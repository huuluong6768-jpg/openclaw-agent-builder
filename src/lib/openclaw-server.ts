import WebSocket from "ws";

type RPCResponse = {
  type: "res";
  id: string;
  ok: boolean;
  result?: unknown;
  error?: { message: string; code?: number };
};

let clientInstance: ServerOpenClawClient | null = null;
let currentUrl = "";
let currentToken = "";

export class ServerOpenClawClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private requestId = 0;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async connect(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) return this.connectPromise;

    this.connected = false;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Connection timeout"));
      }, 10000);

      ws.on("open", () => {
        this.rpc("connect", {
          minProtocol: 3,
          maxProtocol: 4,
          client: { id: "agent-builder-server", version: "1.0.0", platform: "node", mode: "operator" },
          role: "operator",
          scopes: ["operator.read", "operator.write"],
          auth: { token: this.token },
        })
          .then(() => {
            clearTimeout(timeout);
            this.connected = true;
            resolve();
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      });

      ws.on("message", (data: WebSocket.Data) => {
        const msg = JSON.parse(data.toString()) as RPCResponse;
        if (msg.type === "res") {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            if (msg.ok) {
              p.resolve(msg.result);
            } else {
              p.reject(new Error(msg.error?.message ?? "RPC error"));
            }
          }
        }
      });

      ws.on("error", () => {
        clearTimeout(timeout);
        reject(new Error("WebSocket error"));
      });

      ws.on("close", () => {
        this.connected = false;
        this.connectPromise = null;
      });
    });

    return this.connectPromise;
  }

  async rpc(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (method !== "connect") {
        await this.connect();
      }
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        throw new Error("Not connected");
      }
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

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.connectPromise = null;
  }

  isConnected() {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export function getClient(url: string, token: string): ServerOpenClawClient {
  if (clientInstance && currentUrl === url && currentToken === token && clientInstance.isConnected()) {
    return clientInstance;
  }
  if (clientInstance) {
    clientInstance.disconnect();
  }
  clientInstance = new ServerOpenClawClient(url, token);
  currentUrl = url;
  currentToken = token;
  return clientInstance;
}

export async function getConnectedClient(url: string, token: string): Promise<ServerOpenClawClient> {
  const client = getClient(url, token);
  await client.connect();
  return client;
}
