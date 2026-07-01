import { synthAgent } from "@/lib/agents/synth";
import type {
  AgentOutputMap,
  ComputeDecisionResult,
  DetectConflictResult,
  ToolResultMap,
} from "@/lib/types";
import type { MemoryItem } from "@/lib/memory/store";
import type { StockKnowledgeHit } from "@/lib/rag/query";

export async function runSynth({
  input,
  agents,
  toolResults,
  conflict,
  decision,
  ragContext,
  memory,
}: {
  input: string;
  agents: AgentOutputMap;
  toolResults: ToolResultMap;
  conflict: DetectConflictResult;
  decision: ComputeDecisionResult;
  ragContext: StockKnowledgeHit | null;
  memory: MemoryItem[];
}) {
  return synthAgent({
    input,
    bull: { ...agents.bull, toolResult: toolResults.bull },
    bear: { ...agents.bear, toolResult: toolResults.bear },
    neutral: { ...agents.neutral, toolResult: toolResults.neutral },
    conflict,
    decision,
    rag: ragContext,
    tools: toolResults,
    memory,
  });
}
