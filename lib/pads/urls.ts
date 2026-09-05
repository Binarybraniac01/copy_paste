function origin(value: string | undefined): string { return (value || "").replace(/\/$/, ""); }
export function padUrls(sessionId: string) {
  const path = `/p/${encodeURIComponent(sessionId)}`;
  return { normal: `${origin(process.env.NEXT_PUBLIC_NORMAL_ORIGIN)}${path}`, isolated: `${origin(process.env.NEXT_PUBLIC_ISOLATED_ORIGIN)}${path}` };
}
export function urlMode(hostname: string): "Normal URL" | "Isolation URL" | "Custom URL" {
  try { if (hostname === new URL(process.env.NEXT_PUBLIC_NORMAL_ORIGIN || "http://localhost").hostname) return "Normal URL"; if (hostname === new URL(process.env.NEXT_PUBLIC_ISOLATED_ORIGIN || "http://localhost").hostname) return "Isolation URL"; } catch { /* configured origin is invalid */ }
  return "Custom URL";
}
