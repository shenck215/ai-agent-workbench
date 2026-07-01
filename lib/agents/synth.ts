import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import type { SynthAgentPayload } from "@/lib/types";

export async function synthAgent(
  payload: SynthAgentPayload,
): Promise<string | null> {
  const { input, bull, bear, neutral, conflict, decision, rag, tools, memory } =
    payload;

  return await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: `你是 Synthesizer（AI 决策系统）。

你必须基于当前问题 + 历史记忆进行判断。

---

### 历史记忆（非常重要）：
${JSON.stringify(memory, null, 2)}

---

输出结构：

## 结论
## 核心依据
## 分歧点
## 置信度判断
## 建议动作

---

要求：
- 如果历史 memory 中多次出现类似决策，要考虑一致性
- 如果历史判断和当前冲突，要指出“策略变化”`,
      },
      {
        role: "user",
        content: `
用户问题：
${input}

conflict:
${JSON.stringify(conflict)}

decision:
${JSON.stringify(decision)}

rag:
${JSON.stringify(rag)}

tools:
${JSON.stringify(tools)}

Bull:
${JSON.stringify(bull)}

Bear:
${JSON.stringify(bear)}

Neutral:
${JSON.stringify(neutral)}
        `,
      },
    ],
  });
}
