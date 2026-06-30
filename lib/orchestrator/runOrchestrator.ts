import { bullAgent } from "@/lib/agents/bull";
import { bearAgent } from "@/lib/agents/bear";
import { neutralAgent } from "@/lib/agents/neutral";

import { runTool } from "@/lib/tools/router";
import { synthAgent } from "@/lib/agents/synth";
import { fallbackAgentOutput, parseAgentOutput } from "@/lib/agents/agentOutput";

import { log } from "@/lib/telemetry/logger";
import { recordEval } from "@/lib/eval/evaluator";
import { getMemory, saveMemory } from "@/lib/memory/store";
import { queryStock, type StockKnowledgeHit } from "@/lib/rag/query";
import type {
  AgentName,
  AgentOutput,
  ComputeDecisionResult,
  DetectConflictResult,
} from "@/lib/types";

/**
 * 安全解析 LLM 输出
 */
function safeParse(raw: string | null): AgentOutput {
  return parseAgentOutput(raw) ?? fallbackAgentOutput(raw);
}

/**
 * 冲突检测
 */
function detectConflict(bull: number, bear: number): DetectConflictResult {
  const diff = Math.abs(bull - bear);

  return {
    conflict: diff > 0.3,
    level: diff > 0.5 ? "high" : diff > 0.3 ? "medium" : "low",
  };
}

/**
 * 决策计算（简单加权）
 */
function computeDecision(
  bull: AgentOutput,
  bear: AgentOutput,
): ComputeDecisionResult {
  const score = bull.confidence - bear.confidence;

  return {
    score,
    decision:
      score > 0.2
        ? "偏看多"
        : score < -0.2
        ? "偏看空"
        : "中性",
  };
}

/**
 * tool 执行
 */
function executeTool(agent: AgentName, tool: string | null) {
  const toolCall = tool || "none";

  log({ type: "tool_call", agent, tool: toolCall, input: toolCall });

  const result = tool ? runTool(tool) : null;

  log({ type: "tool_result", agent, tool: toolCall, output: result });

  return result;
}

function buildAgentInput(input: string, rag: StockKnowledgeHit | null) {
  if (!rag) return input;

  return `${input}

---
RAG context:
${JSON.stringify(rag, null, 2)}`;
}

/**
 * 核心 Orchestrator
 */
export async function runOrchestrator(input: string) {
  // =========================
  // 1. log start
  // =========================
  log({ type: "agent_start", agent: "bull", input });
  log({ type: "agent_start", agent: "bear", input });
  log({ type: "agent_start", agent: "neutral", input });

  const rag = queryStock(input);
  const agentInput = buildAgentInput(input, rag);

  log({ type: "rag", input, output: rag });

  // =========================
  // 2. run agents (parallel)
  // =========================
  const [bullRaw, bearRaw, neutralRaw] = await Promise.all([
    bullAgent(agentInput),
    bearAgent(agentInput),
    neutralAgent(agentInput),
  ]);

  // =========================
  // 3. parse outputs
  // =========================
  const bull = safeParse(bullRaw);
  const bear = safeParse(bearRaw);
  const neutral = safeParse(neutralRaw);

  log({ type: "agent_end", agent: "bull", output: bull });
  log({ type: "agent_end", agent: "bear", output: bear });
  log({ type: "agent_end", agent: "neutral", output: neutral });

  // =========================
  // 4. tool execution
  // =========================
  const bullTool = executeTool("bull", bull.tool);
  const bearTool = executeTool("bear", bear.tool);
  const neutralTool = executeTool("neutral", neutral.tool);

  // =========================
  // 5. decision layer
  // =========================
  const conflict = detectConflict(bull.confidence, bear.confidence);
  const decision = computeDecision(bull, bear);
  const memory = getMemory(input);

  log({ type: "decision", data: decision });
  log({ type: "memory", input, output: memory });

  // =========================
  // 6. synth layer
  // =========================
  const final = await synthAgent({
    input,
    bull: { ...bull, toolResult: bullTool },
    bear: { ...bear, toolResult: bearTool },
    neutral: { ...neutral, toolResult: neutralTool },
    conflict,
    decision,
    memory,
  });

  log({ type: "synth", output: final });

  // =========================
  // 7. memory / learning
  // =========================
  saveMemory({
    input,
    decision: decision.decision,
    timestamp: Date.now(),
    tags: rag ? [rag.symbol, rag.name, ...rag.aliases] : [],
  });

  recordEval({
    input,
    decision: decision.decision,
    bullConfidence: bull.confidence,
    bearConfidence: bear.confidence,
  });

  // =========================
  // 8. return result
  // =========================
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
