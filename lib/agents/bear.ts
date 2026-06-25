import type OpenAI from "openai";

// 🐻 Bear Agent
export async function bearAgent(openai: OpenAI, input: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "你是看空分析师，只输出风险、问题、潜在下跌因素。",
      },
      { role: "user", content: input },
    ],
  });

  return res.choices[0].message.content;
}
