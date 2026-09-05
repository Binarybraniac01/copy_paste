import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PadEditor from "@/components/PadEditor";
import SessionActions from "@/components/SessionActions";
import { isSessionId } from "@/lib/validation/pad";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function PadPage({ params }: { params: Promise<{sessionId: string}> }) { const { sessionId } = await params; if (!isSessionId(sessionId)) notFound(); return <main className="mx-auto flex min-h-screen max-w-5xl flex-col p-4 sm:p-6"><header><Link href="/" className="text-xl font-semibold tracking-tight">BridgePad</Link><p className="mt-3 text-sm text-slate-600">Session: <code className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">{sessionId}</code></p></header><PadEditor sessionId={sessionId}/><SessionActions sessionId={sessionId}/></main>; }
