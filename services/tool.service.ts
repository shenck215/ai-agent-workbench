import { runTool } from "@/lib/tools/router";
import { log } from "@/lib/telemetry/logger";
import type { AgentName, AgentOutputMap, ToolResultMap } from "@/lib/types";

const agentNames = ["bull", "bear", "neutral"] as const;

function executeTool(agent: AgentName, tool: string | null) {
  const toolCall = tool ?? "none";

  log({ type: "tool_call", agent, tool: toolCall, input: toolCall });

  const result = tool ? runTool(tool) : null;

  log({ type: "tool_result", agent, tool: toolCall, output: result });

  return result;
}

export async function runTools(agents: AgentOutputMap): Promise<ToolResultMap> {
  return agentNames.reduce<ToolResultMap>(
    (results, agent) => ({
      ...results,
      [agent]: executeTool(agent, agents[agent].tool),
    }),
    {
      bull: null,
      bear: null,
      neutral: null,
    },
  );
}
