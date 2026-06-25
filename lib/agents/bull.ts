import type OpenAI from "openai";

// 🐂 Bull Agent
export async function bullAgent(openai: OpenAI, input: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
你是投资分析Agent。

如果你需要数据，请输出：

TOOL: toolName:input

可用工具：
- calculator
- stock

否则直接回答。
        `,
      },
      {
        role: "user",
        content: input,
      },
    ],
  });

  return res.choices[0].message.content;
}