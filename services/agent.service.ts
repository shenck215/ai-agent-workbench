import { bullAgent } from "@/lib/agents/bull";
import { bearAgent } from "@/lib/agents/bear";
import { neutralAgent } from "@/lib/agents/neutral";
import { fallbackAgentOutput, parseAgentOutput } from "@/lib/agents/agentOutput";
import { log } from "@/lib/telemetry/logger";
import type { AgentOutput, AgentOutputMap } from "@/lib/types";
import type { Plan } from "@/lib/planner/planner";
import type { StockKnowledgeHit } from "@/lib/rag/query";

const agentNames = ["bull", "bear", "neutral"] as const;

function buildAgentInput(input: string, rag: StockKnowledgeHit | null) {
  if (!rag) return input;

  return `${input}

---
RAG context:
${JSON.stringify(rag, null, 2)}`;
}

function normalizeAgentOutput(raw: string | null): AgentOutput {
  return parseAgentOutput(raw) ?? fallbackAgentOutput(raw);
}

export async function runAgents(
  input: string,
  plan: Plan,
  rag: StockKnowledgeHit | null,
): Promise<AgentOutputMap> {
  const agentInput = buildAgentInput(input, rag);

  for (const agent of agentNames) {
    if (plan.agents.includes(agent)) {
      log({ type: "agent_start", agent, input: agentInput });
    }
  }

  const [bull, bear, neutral] = await Promise.all([
    plan.agents.includes("bull") ? bullAgent(agentInput) : null,
    plan.agents.includes("bear") ? bearAgent(agentInput) : null,
    plan.agents.includes("neutral") ? neutralAgent(agentInput) : null,
  ]);

  const agents: AgentOutputMap = {
    bull: normalizeAgentOutput(bull),
    bear: normalizeAgentOutput(bear),
    neutral: normalizeAgentOutput(neutral),
  };

  for (const agent of agentNames) {
    log({
      type: "agent_end",
      agent,
      output: agents[agent],
    });
  }

  return agents;
}
