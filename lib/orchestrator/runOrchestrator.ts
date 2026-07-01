import { createPlan } from "@/lib/planner/planner";
import { runAgents } from "@/services/agent.service";
import { runTools } from "@/services/tool.service";
import { runRag } from "@/services/rag.service";
import { detectConflict, runDecision } from "@/services/decision.service";
import { runSynth } from "@/services/synth.service";
import { getMemory, saveMemory } from "@/lib/memory/store";
import { log } from "@/lib/telemetry/logger";
import { recordEval } from "@/lib/eval/evaluator";
import type { ToolResultMap } from "@/lib/types";

export async function runOrchestrator(input: string) {
  // 🧠 1. planner
  const plan = createPlan(input);

  log({ type: "planner", plan });

  // 🧠 2. rag
  const ragContext = plan.useRag ? await runRag(input) : null;

  // 🧠 3. agents
  const agents = await runAgents(input, plan, ragContext);

  // 🧠 4. tools
  const emptyToolResults: ToolResultMap = {
    bull: null,
    bear: null,
    neutral: null,
  };
  const toolResults = plan.useTools ? await runTools(agents) : emptyToolResults;

  // 🧠 5. memory
  const memory = getMemory(input);

  log({ type: "memory", input, output: memory });

  // 🧠 6. decision
  const conflict = detectConflict(agents);
  const decision = runDecision(agents);

  log({ type: "decision", data: decision });

  // 🧠 7. synth
  const final = await runSynth({
    input,
    agents,
    toolResults,
    conflict,
    decision,
    ragContext,
    memory,
  });

  log({ type: "synth", output: final });

  // 🧠 8. memory write-back
  saveMemory({
    input,
    decision: decision.decision,
    timestamp: Date.now(),
    tags: ragContext
      ? [ragContext.symbol, ragContext.name, ...ragContext.aliases]
      : [],
  });

  recordEval({
    input,
    decision: decision.decision,
    bullConfidence: agents.bull.confidence,
    bearConfidence: agents.bear.confidence,
  });

  return {
    plan,
    bull: agents.bull,
    bear: agents.bear,
    neutral: agents.neutral,
    agents,
    tools: toolResults,
    toolResults,
    conflict,
    decision,
    rag: ragContext,
    memory,
    final,
  };
}
