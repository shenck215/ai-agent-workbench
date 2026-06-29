import { bullAgent } from "@/lib/agents/bull";
import { bearAgent } from "@/lib/agents/bear";
import { neutralAgent } from "@/lib/agents/neutral";

import { runTool } from "@/lib/tools/router";
import { synthAgent } from "@/lib/agents/synth";
import { ComputeDecisionResult, DetectConflictResult } from "../types";
import { log } from "@/lib/telemetry/logger";
import { saveMemory, getMemory } from "@/lib/memory/store";
import { queryStock, type StockKnowledgeHit } from "@/lib/rag/query";

type AgentOutput = {
  thought: string;
  tool: string | null;
  final: string;
  confidence: number;
};

function safeParse(raw: string | null): AgentOutput {
  if (!raw) {
    return {
      thought: "",
      tool: null,
      final: "",
      confidence: 0.3,
    };
  }

  try {
    const obj = JSON.parse(raw);

    return {
      thought: obj.thought ?? "",
      tool: obj.tool ?? null,
      final: obj.final ?? "",
      confidence: obj.confidence ?? 0.5,
    };
  } catch {
    return {
      thought: raw,
      tool: null,
      final: raw,
      confidence: 0.5,
    };
  }
}

function detectConflict(bull: number, bear: number): DetectConflictResult {
  const diff = Math.abs(bull - bear);

  return {
    conflict: diff > 0.3,
    level: diff > 0.5 ? "high" : diff > 0.3 ? "medium" : "low",
  };
}

function computeDecision(
  bull: AgentOutput,
  bear: AgentOutput,
): ComputeDecisionResult {
  const score = bull.confidence - bear.confidence;

  return {
    score,
    decision: score > 0.2 ? "偏看多" : score < -0.2 ? "偏看空" : "中性",
  };
}

function buildAgentInput(input: string, rag: StockKnowledgeHit | null) {
  if (!rag) return input;

  return `${input}

---
RAG context:
${JSON.stringify(rag, null, 2)}`;
}

export async function runOrchestrator(input: string) {
  // 🧠 1. agents
  log({ type: "agent_start", agent: "bull", input });
  log({ type: "agent_start", agent: "bear", input });
  log({ type: "agent_start", agent: "neutral", input });

  const rag = queryStock(input);
  const agentInput = buildAgentInput(input, rag);

  log({ type: "rag", input, output: rag });

  const [bullRaw, bearRaw, neutralRaw] = await Promise.all([
    bullAgent(agentInput),
    bearAgent(agentInput),
    neutralAgent(agentInput),
  ]);

  const bull = safeParse(bullRaw);
  const bear = safeParse(bearRaw);
  const neutral = safeParse(neutralRaw);

  log({ type: "agent_end", agent: "bull", output: bull });
  log({ type: "agent_end", agent: "bear", output: bear });
  log({ type: "agent_end", agent: "neutral", output: neutral });

  // 🔧 2. tools
  if (bull.tool) {
    log({ type: "tool_call", tool: bull.tool, input });
  }
  const bullTool = runTool(bull.tool);

  if (bull.tool) {
    log({ type: "tool_result", tool: bull.tool, output: bullTool });
  }

  if (bear.tool) {
    log({ type: "tool_call", tool: bear.tool, input });
  }
  const bearTool = runTool(bear.tool);

  if (bear.tool) {
    log({ type: "tool_result", tool: bear.tool, output: bearTool });
  }

  if (neutral.tool) {
    log({ type: "tool_call", tool: neutral.tool, input });
  }
  const neutralTool = runTool(neutral.tool);

  if (neutral.tool) {
    log({ type: "tool_result", tool: neutral.tool, output: neutralTool });
  }

  // ⚖️ 3. decision layer
  const conflict = detectConflict(bull.confidence, bear.confidence);
  const decision = computeDecision(bull, bear);

  log({ type: "decision", data: { conflict, decision } });

  const history = getMemory(input);

  log({ type: "memory", input, output: history });

  // 🧠 4. synth layer（解释层）
  const final = await synthAgent({
    input,
    bull: { ...bull, toolResult: bullTool },
    bear: { ...bear, toolResult: bearTool },
    neutral: { ...neutral, toolResult: neutralTool },
    conflict,
    decision,
    memory: history,
  });

  saveMemory({
    input,
    decision: decision.decision,
    timestamp: Date.now(),
    tags: rag ? [rag.symbol, rag.name, ...rag.aliases] : [],
  });

  log({ type: "synth", output: final });

  return {
    bull,
    bear,
    neutral,
    tools: {
      bull: bullTool,
      bear: bearTool,
      neutral: neutralTool,
    },
    conflict,
    decision,
    rag,
    final,
  };
}
