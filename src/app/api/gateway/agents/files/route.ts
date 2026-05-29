import { NextRequest } from "next/server";
import { getConnectedClient } from "@/lib/openclaw-server";

export async function GET(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const agentId = request.nextUrl.searchParams.get("agentId");
    const name = request.nextUrl.searchParams.get("name");

    if (!agentId) {
      return Response.json({ error: "Missing agentId" }, { status: 400 });
    }

    const client = await getConnectedClient(url, token);

    if (name) {
      const result = await client.rpc("agents.files.get", { agentId, name });
      return Response.json(result);
    } else {
      const result = await client.rpc("agents.files.list", { agentId });
      return Response.json(result);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get agent files";
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

    const { agentId, name, content } = (await request.json()) as {
      agentId: string;
      name: string;
      content: string;
    };

    if (!agentId || !name) {
      return Response.json({ error: "Missing agentId or name" }, { status: 400 });
    }

    const client = await getConnectedClient(url, token);
    const result = await client.rpc("agents.files.set", { agentId, name, content });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to set agent file";
    return Response.json({ error: message }, { status: 500 });
  }
}
