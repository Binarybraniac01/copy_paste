import { NextResponse } from "next/server";
import { findPad, updatePad } from "@/lib/pads/store";
import { isSessionId, validateContent } from "@/lib/validation/pad";
export const runtime = "nodejs";
function problem(message: string, status: number) { return NextResponse.json({ error: message }, { status }); }
export async function GET(_: Request, { params }: { params: Promise<{sessionId: string}> }) {
 const { sessionId } = await params; if (!isSessionId(sessionId)) return problem("This pad link is invalid.", 400);
 try { const pad = await findPad(sessionId); if (!pad) return problem("This pad was not found.", 404); if (new Date(pad.expires_at) <= new Date()) return problem("This pad has expired.", 410); return NextResponse.json(pad, { headers: { "Cache-Control": "no-store" } }); }
 catch { return problem("Unable to load this pad right now.", 503); }
}
export async function PATCH(request: Request, { params }: { params: Promise<{sessionId: string}> }) {
 const { sessionId } = await params; if (!isSessionId(sessionId)) return problem("This pad link is invalid.", 400);
 let body: {content?: unknown}; try { body = await request.json(); } catch { return problem("Invalid request.", 400); }
 const validation = validateContent(body.content); if (validation) return problem(validation, 413);
 try { const pad = await updatePad(sessionId, body.content as string); if (!pad) { const existing = await findPad(sessionId); return problem(existing ? "This pad has expired." : "This pad was not found.", existing ? 410 : 404); } return NextResponse.json(pad); }
 catch { return problem("Unable to save your change. Your text remains in this browser; please retry.", 503); }
}
