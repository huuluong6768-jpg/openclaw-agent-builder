import { NextRequest } from "next/server";
import { getConnectedClient } from "@/lib/openclaw-server";

export async function GET(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const client = await getConnectedClient(url, token);
    const result = await client.rpc("config.get", {});
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get config";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const { config, baseHash } = (await request.json()) as {
      config: Record<string, unknown>;
      baseHash: string;
    };

    const client = await getConnectedClient(url, token);
    const result = await client.rpc("config.set", { config, baseHash });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to set config";
    return Response.json({ error: message }, { status: 500 });
  }
}
