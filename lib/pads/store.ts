import { serverSupabase } from "@/lib/supabase/server";
import { newSessionId } from "@/lib/validation/pad";
export type Pad = { session_id: string; content: string; updated_at: string; expires_at: string };
function ttlMinutes() { const value = Number(process.env.PAD_TTL_MINUTES); return Number.isInteger(value) && value > 0 ? value : 60; }
export async function createPad(): Promise<Pad> {
 const db = serverSupabase(); const expiresAt = new Date(Date.now() + ttlMinutes() * 60_000).toISOString();
 for (let attempt = 0; attempt < 3; attempt++) {
  const sessionId = newSessionId();
  const { data, error } = await db.from("pads").insert({ session_id: sessionId, expires_at: expiresAt }).select("session_id, content, updated_at, expires_at").single();
  if (!error && data) return data;
  if (error?.code !== "23505") break;
 }
 throw new Error("Could not create pad.");
}
export async function findPad(sessionId: string): Promise<Pad | null> {
 const { data, error } = await serverSupabase().from("pads").select("session_id, content, updated_at, expires_at").eq("session_id", sessionId).maybeSingle();
 if (error) throw new Error("Could not load pad.");
 return data;
}
export async function updatePad(sessionId: string, content: string): Promise<Pad | null> {
 const { data, error } = await serverSupabase().from("pads").update({ content }).eq("session_id", sessionId).gt("expires_at", new Date().toISOString()).select("session_id, content, updated_at, expires_at").maybeSingle();
 if (error) throw new Error("Could not save pad.");
 return data;
}
