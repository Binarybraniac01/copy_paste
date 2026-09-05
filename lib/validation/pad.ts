export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{12,16}$/;
export const DEFAULT_MAX_PAD_SIZE_BYTES = 1_048_576;
export function isSessionId(value: string): boolean { return SESSION_ID_PATTERN.test(value); }
export function maxPadSizeBytes(): number { const n = Number(process.env.MAX_PAD_SIZE_BYTES); return Number.isInteger(n) && n > 0 ? n : DEFAULT_MAX_PAD_SIZE_BYTES; }
export function validateContent(content: unknown): string | null {
  if (typeof content !== "string") return "Pad content must be plain text.";
  if (new TextEncoder().encode(content).byteLength > maxPadSizeBytes()) return `Pad content exceeds the ${maxPadSizeBytes()} byte limit.`;
  return null;
}
export function newSessionId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, byte => alphabet[byte & 63]).join("");
}
