import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { adjustConfidence } from "@/lib/eval/calibration";
import { optimizePrompt } from "@/lib/prompts/optimizer";
import { parseAgentOutput, serializeAgentOutput } from "./agentOutput";

export async function bearAgent(input: string) {
  const systemPrompt = optimizePrompt(`
你是 Bear Agent（看空分析师）。

输出 JSON：

{
  "thought": "...",
  "tool": "stock:AAPL 或 calculator:2+3 或 null",
  "final": "...",
  "confidence": 0~1
}

必须强调风险与下行压力。
`);

  const res = await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: input,
      },
    ],
  });

  if (!res) return null;

  const output = parseAgentOutput(res);
  if (!output) {
    return res;
  }

  return serializeAgentOutput({
    ...output,
    confidence: Math.max(
      0,
      Math.min(output.confidence * adjustConfidence("bear"), 1),
    ),
  });
}
