import { NextRequest } from "next/server";
import { getConnectedClient } from "@/lib/openclaw-server";

export async function POST(request: NextRequest) {
  try {
    const { url, token } = (await request.json()) as { url: string; token: string };
    if (!url || !token) {
      return Response.json({ ok: false, error: "Missing url or token" }, { status: 400 });
    }

    const client = await getConnectedClient(url, token);
    return Response.json({ ok: true, connected: client.isConnected() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
