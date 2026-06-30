import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { adjustConfidence } from "@/lib/eval/calibration";
import { optimizePrompt } from "@/lib/prompts/optimizer";
import { parseAgentOutput, serializeAgentOutput } from "./agentOutput";

export async function bullAgent(input: string) {
  const systemPrompt = optimizePrompt(`
你是 Bull Agent（看多分析师）。

输出 JSON：

{
  "thought": "...",
  "tool": "stock:AAPL 或 calculator:2+3 或 null",
  "final": "...",
  "confidence": 0~1
}

必须偏向增长与机会分析。
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
      Math.min(output.confidence * adjustConfidence("bull"), 1),
    ),
  });
}
