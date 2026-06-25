import type OpenAI from "openai";

// ⚖️ Neutral Agent
export async function neutralAgent(openai: OpenAI, input: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "你是中立分析师，只做事实总结，不给建议。",
      },
      { role: "user", content: input },
    ],
  });

  return res.choices[0].message.content;
}
