import type { LogEvent } from "@/lib/telemetry/logger";

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
};

export type AgentsApiResponse = {
  bull: AgentOutput;
  bear: AgentOutput;
  neutral: AgentOutput;
  tools: Record<AgentName, unknown | null>;
  conflict: DetectConflictResult;
  decision: ComputeDecisionResult;
  final: string | null;
  logs: LogEvent[];
};
