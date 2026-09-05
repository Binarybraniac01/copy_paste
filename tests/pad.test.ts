import { describe, expect, it } from "vitest";
import { isSessionId, newSessionId, validateContent } from "../lib/validation/pad";
import { padUrls } from "../lib/pads/urls";
class MemoryPads { private pads = new Map<string, {content: string; expires: number}>(); create(id: string, ttl = 3600_000) { this.pads.set(id, { content: "", expires: Date.now() + ttl }); } get(id: string) { const pad = this.pads.get(id); return !pad ? "missing" : pad.expires <= Date.now() ? "expired" : pad; } update(id: string, content: string) { const pad = this.get(id); if (typeof pad === "string") return pad; pad.content = content; return pad; } }
describe("BridgePad domain and session rules", () => {
 it("generates random URL-safe 12-character session IDs", () => { const ids = new Set(Array.from({ length: 100 }, newSessionId)); expect(ids.size).toBe(100); expect([...ids].every(isSessionId)).toBe(true); expect(isSessionId("1")).toBe(false); });
 it("builds both configured URLs", () => { process.env.NEXT_PUBLIC_NORMAL_ORIGIN = "https://normal.test/"; process.env.NEXT_PUBLIC_ISOLATED_ORIGIN = "https://isolation.test"; expect(padUrls("ABcdEF12_ghi")).toEqual({normal:"https://normal.test/p/ABcdEF12_ghi", isolated:"https://isolation.test/p/ABcdEF12_ghi"}); });
 it("validates configured content size", () => { process.env.MAX_PAD_SIZE_BYTES = "4"; expect(validateContent("test")).toBeNull(); expect(validateContent("tests")).toContain("4 byte"); });
});
describe("pad lifecycle and two-view synchronization", () => {
 it("creates, loads, updates, and clears a valid pad", () => { const store = new MemoryPads(); const id = newSessionId(); store.create(id); expect(store.get(id)).toMatchObject({content:""}); expect(store.update(id, "Hello from normal browser")).toMatchObject({content:"Hello from normal browser"}); const browserB = store.get(id); expect(browserB).toMatchObject({content:"Hello from normal browser"}); expect(store.update(id, "Hello from isolated browser")).toMatchObject({content:"Hello from isolated browser"}); expect(store.get(id)).toMatchObject({content:"Hello from isolated browser"}); expect(store.update(id, "")).toMatchObject({content:""}); });
 it("reports invalid, missing, and expired pads", () => { const store = new MemoryPads(); expect(isSessionId("not valid!"), "invalid ID").toBe(false); expect(store.get("missing")).toBe("missing"); store.create("ExpiredPad_1", -1); expect(store.get("ExpiredPad_1")).toBe("expired"); });
});
