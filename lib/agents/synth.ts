import type OpenAI from "openai";

// 🧠 Synthesizer Agent
export async function synthAgent(
  openai: OpenAI,
  input: string,
  bull: string,
  bear: string,
  neutral: string,
) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "你是决策整合专家，需要综合多个观点，输出结论、风险和建议。",
      },
      {
        role: "user",
        content: `
问题：${input}

看多观点：
${bull}

看空观点：
${bear}

中性观点：
${neutral}

请输出：
1. 结论
2. 风险
3. 建议
        `,
      },
    ],
  });

  return res.choices[0].message.content;
}
