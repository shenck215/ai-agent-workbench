export type LogEvent =
  | {
      type: "agent_start";
      agent: string;
      input: string;
    }
  | {
      type: "agent_end";
      agent: string;
      output: unknown;
    }
  | {
      type: "tool_call";
      agent: string;
      tool: string;
      input: string;
    }
  | {
      type: "tool_result";
      agent: string;
      tool: string;
      output: unknown;
    }
  | {
      type: "decision";
      data: unknown;
    }
  | {
      type: "rag";
      input: string;
      output: unknown;
    }
  | {
      type: "memory";
      input: string;
      output: unknown;
    }
  | {
      type: "synth";
      output: string | null;
    };

const logs: LogEvent[] = [];

export function log(event: LogEvent) {
  logs.push(event);
}

export function getLogs() {
  return logs;
}

export function clearLogs() {
  logs.length = 0;
}
