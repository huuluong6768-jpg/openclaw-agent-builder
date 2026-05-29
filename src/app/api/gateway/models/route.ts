import { NextRequest } from "next/server";
import { getConnectedClient } from "@/lib/openclaw-server";

export async function GET(request: NextRequest) {
  try {
    const url = request.headers.get("x-gateway-url");
    const token = request.headers.get("x-gateway-token");
    if (!url || !token) {
      return Response.json({ error: "Missing gateway credentials" }, { status: 400 });
    }

    const view = request.nextUrl.searchParams.get("view") ?? "all";
    const client = await getConnectedClient(url, token);
    const result = await client.rpc("models.list", { view });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list models";
    return Response.json({ error: message }, { status: 500 });
  }
}
