import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/inventory";

// Polled by the client (via SWR) every few seconds to keep displayed
// stock counts in sync with server state — e.g. after another shopper
// checks out, or stock is adjusted. For true push-based real-time,
// swap this for a WebSocket or Server-Sent Events channel that emits
// on every `reserveStock`/`restock` call.
export async function GET() {
  const snapshot = getSnapshot();
  return NextResponse.json({ inventory: snapshot, timestamp: Date.now() });
}

export const dynamic = "force-dynamic";
