import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "BridgePad", description: "A temporary shared plain-text pad." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
