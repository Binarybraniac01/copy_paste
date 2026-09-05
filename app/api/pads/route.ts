import { NextResponse } from "next/server";
import { createPad } from "@/lib/pads/store";
export const runtime = "nodejs";
const requests = new Map<string, number[]>();
function allowed(ip: string) { const now = Date.now(); const recent = (requests.get(ip) ?? []).filter(time => now - time < 60_000); if (recent.length >= 12) return false; recent.push(now); requests.set(ip, recent); return true; }
export async function POST(request: Request) {
 const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
 if (!allowed(ip)) return NextResponse.json({ error: "Too many new pads. Please try again shortly." }, { status: 429 });
 try { const pad = await createPad(); return NextResponse.json({ sessionId: pad.session_id }, { status: 201 }); }
 catch { return NextResponse.json({ error: "Unable to create a pad right now. Please try again." }, { status: 503 }); }
}
