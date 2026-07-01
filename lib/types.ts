import type { LogEvent } from "@/lib/telemetry/logger";
import type { MemoryItem } from "@/lib/memory/store";
import type { Plan } from "@/lib/planner/planner";
import type { StockKnowledgeHit } from "@/lib/rag/query";

export type AgentName = "bull" | "bear" | "neutral";

export type AgentOutput = {
  thought: string;
  tool: string | null;
  final: string;
  confidence: number;
};

export type ToolTraceItem = {
  agent: AgentName;
  toolCall: string;
  result: unknown;
};

export type TimelineItem =
  | {
      type: "agent_start";
      agent: AgentName;
      label: string;
    }
  | {
      type: "agent_done";
      agent: AgentName;
      label: string;
    }
  | {
      type: "tool_call";
      agent: AgentName;
      toolCall: string;
    }
  | {
      type: "tool_result";
      agent: AgentName;
      result: unknown;
    }
  | {
      type: "synth_start";
      label: string;
    }
  | {
      type: "synth_done";
      label: string;
    };

export type AgentRun = {
  raw: string;
  parsed: AgentOutput;
  toolResult: unknown | null;
  final: string;
};

export type AgentOutputWithToolResult = AgentOutput & {
  toolResult: unknown | null;
};

export type AgentOutputMap = Record<AgentName, AgentOutput>;

export type ToolResultMap = Record<AgentName, unknown | null>;

export type SynthApiResponse = {
  bull: AgentRun;
  bear: AgentRun;
  neutral: AgentRun;
  final: string;
  trace: ToolTraceItem[];
  timeline: TimelineItem[];
};

export type DetectConflictResult = {
  conflict: boolean;
  level: "low" | "medium" | "high";
};

export type DecisionType = "偏看多" | "偏看空" | "中性";

export type ComputeDecisionResult = {
  score: number;
  decision: DecisionType;
};

export type SynthAgentPayload = {
  input: string;
  bull: AgentOutputWithToolResult;
  bear: AgentOutputWithToolResult;
  neutral: AgentOutputWithToolResult;
  conflict: DetectConflictResult;
  decision: ComputeDecisionResult;
  rag: StockKnowledgeHit | null;
  tools: ToolResultMap;
  memory: MemoryItem[];
};

export type AgentsApiResponse = {
  plan: Plan;
  bull: AgentOutput;
  bear: AgentOutput;
  neutral: AgentOutput;
  agents: AgentOutputMap;
  tools: ToolResultMap;
  toolResults: ToolResultMap;
  conflict: DetectConflictResult;
  decision: ComputeDecisionResult;
  rag: StockKnowledgeHit | null;
  memory: MemoryItem[];
  final: string | null;
  logs: LogEvent[];
};
