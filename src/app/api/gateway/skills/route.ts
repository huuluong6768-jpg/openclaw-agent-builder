import { NextRequest } from "next/server";
import { getConnectedClient } from "@/lib/openclaw-server";

export async function GET(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const query = request.nextUrl.searchParams.get("query") ?? "";
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("skills.search", { query });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to search skills";
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

    const { slug } = (await request.json()) as { slug: string };
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("skills.install", { source: "clawhub", slug });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to install skill";
    return Response.json({ error: message }, { status: 500 });
  }
}
