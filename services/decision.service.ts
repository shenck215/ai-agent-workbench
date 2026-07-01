import type {
  AgentOutputMap,
  ComputeDecisionResult,
  DetectConflictResult,
} from "@/lib/types";

export function detectConflict(agents: AgentOutputMap): DetectConflictResult {
  const diff = Math.abs(agents.bull.confidence - agents.bear.confidence);

  return {
    conflict: diff > 0.3,
    level: diff > 0.5 ? "high" : diff > 0.3 ? "medium" : "low",
  };
}

export function runDecision(agents: AgentOutputMap): ComputeDecisionResult {
  const score = agents.bull.confidence - agents.bear.confidence;

  return {
    score,
    decision: score > 0.2 ? "偏看多" : score < -0.2 ? "偏看空" : "中性",
  };
}
