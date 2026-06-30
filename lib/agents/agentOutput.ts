import type { AgentOutput } from "@/lib/types";

const TOOL_PATTERN = /^(stock:[A-Z0-9.-]+|calculator:[0-9+\-*/().\s]+)$/;

function clampConfidence(value: unknown) {
  const confidence =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0.5;

  if (!Number.isFinite(confidence)) return 0.5;

  return Math.max(0, Math.min(confidence, 1));
}

function normalizeTool(value: unknown) {
  if (value === null || value === undefined || value === "null") return null;
  if (typeof value !== "string") return null;

  const tool = value.trim();
  if (!tool) return null;

  return TOOL_PATTERN.test(tool) ? tool : null;
}

function extractJsonCandidate(raw: string) {
  const trimmed = raw.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedJson?.[1]) return fencedJson[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

export function parseAgentOutput(raw: string | null): AgentOutput | null {
  if (!raw) return null;

  try {
    const obj = JSON.parse(extractJsonCandidate(raw)) as Record<string, unknown>;

    return {
      thought:
        typeof obj.thought === "string"
          ? obj.thought
          : typeof obj.final === "string"
            ? obj.final
            : "",
      tool: normalizeTool(obj.tool),
      final:
        typeof obj.final === "string"
          ? obj.final
          : typeof obj.thought === "string"
            ? obj.thought
            : "",
      confidence: clampConfidence(obj.confidence),
    };
  } catch {
    return null;
  }
}

export function fallbackAgentOutput(raw: string | null): AgentOutput {
  return {
    thought: raw ?? "",
    tool: null,
    final: raw ?? "",
    confidence: 0.5,
  };
}

export function serializeAgentOutput(output: AgentOutput) {
  return JSON.stringify(output);
}
