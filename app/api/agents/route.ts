import { NextResponse } from "next/server";
import { runOrchestrator } from "@/lib/orchestrator/runOrchestrator";
import { getLogs, clearLogs } from "@/lib/telemetry/logger";

const MAX_INPUT_LENGTH = 1000;

function validateInput(body: unknown) {
  if (!body || typeof body !== "object" || !("input" in body)) {
    return { ok: false as const, error: "Missing required field: input" };
  }

  const input = (body as { input: unknown }).input;

  if (typeof input !== "string") {
    return { ok: false as const, error: "Field input must be a string" };
  }

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { ok: false as const, error: "Field input cannot be empty" };
  }

  if (trimmedInput.length > MAX_INPUT_LENGTH) {
    return {
      ok: false as const,
      error: `Field input must be ${MAX_INPUT_LENGTH} characters or fewer`,
    };
  }

  return { ok: true as const, input: trimmedInput };
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const validation = validateInput(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  clearLogs();

  try {
    const result = await runOrchestrator(validation.input);

    return NextResponse.json({
      ...result,
      logs: getLogs(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Agent orchestration failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        logs: getLogs(),
      },
      { status: 500 },
    );
  }
}
