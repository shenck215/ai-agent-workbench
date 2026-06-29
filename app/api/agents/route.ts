import { NextResponse } from "next/server";
import { runOrchestrator } from "@/lib/orchestrator/runOrchestrator";
import { clearLogs, getLogs } from "@/lib/telemetry/logger";

export async function POST(req: Request) {
  const { input } = await req.json();

  clearLogs();

  if (!input) {
    return NextResponse.json({ error: "input required" }, { status: 400 });
  }

  const result = await runOrchestrator(input);

  return NextResponse.json({ ...result, logs: getLogs() });
}
