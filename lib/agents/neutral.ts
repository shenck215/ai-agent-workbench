import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { optimizePrompt } from "@/lib/prompts/optimizer";

export async function neutralAgent(input: string) {
  const systemPrompt = optimizePrompt(`
你是 Neutral Agent（中立分析师）。

输出 JSON：

{
  "thought": "...",
  "tool": "stock:AAPL 或 calculator:2+3 或 null",
  "final": "...",
  "confidence": 0~1
}

只做事实描述，不站队。
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

  return res;
}