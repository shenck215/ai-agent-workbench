import OpenAI from "openai";
import { bullAgent } from "@/lib/agents/bull";
import { bearAgent } from "@/lib/agents/bear";
import { neutralAgent } from "@/lib/agents/neutral";
import { synthAgent } from "@/lib/agents/synth";
import { runTool } from "@/lib/tools/router";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractTool(text: string) {
  if (!text.includes("TOOL:")) return null;
  return text.split("TOOL:")[1].trim();
}

export async function POST(req: Request) {
  const { input } = await req.json();

  // 🧠 Step 1：并行 agent
  const [bullRaw = '', bearRaw = '', neutralRaw = ''] = await Promise.all([
    bullAgent(openai, input),
    bearAgent(openai, input),
    neutralAgent(openai, input),
  ]);

  // 🔧 Step 2：tool 执行（Bull 示例）
  let bullToolResult = null;

  const toolCall = extractTool(bullRaw || '');

  if (toolCall) {
    bullToolResult = runTool(toolCall);
  }

  // 🧠 Step 3：二次增强 Bull（结合 tool）
  let bullFinal = bullRaw;

  if (bullToolResult) {
    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "你是投资分析师，需要结合工具结果重新分析。",
        },
        {
          role: "user",
          content: `
原问题：${input}

工具结果：${bullToolResult}

原分析：${bullRaw}
          `,
        },
      ],
    });

    bullFinal = res.choices[0].message.content || bullRaw;
  }

  // 🧠 Step 4：最终汇总
  const final = await synthAgent(
    openai,
    input,
    bullFinal!,
    bearRaw!,
    neutralRaw!
  );

  return Response.json({
    bull: bullFinal,
    bear: bearRaw,
    neutral: neutralRaw,
    tool: bullToolResult,
    final,
  });
}