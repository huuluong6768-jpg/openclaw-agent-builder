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
    const result = await client.rpc("agents.list", {});
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list agents";
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

    const body = await request.json();
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("agents.create", body);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create agent";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const body = await request.json();
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("agents.update", body);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update agent";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const { agentId, deleteFiles } = (await request.json()) as { agentId: string; deleteFiles?: boolean };
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("agents.delete", { agentId, deleteFiles: deleteFiles ?? false });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete agent";
    return Response.json({ error: message }, { status: 500 });
  }
}
