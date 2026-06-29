import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import type { SynthAgentPayload } from "@/lib/types";
import { SYNTH_PROMPT } from "../prompts/version";

export async function synthAgent(
  payload: SynthAgentPayload,
): Promise<string | null> {
  const { input, bull, bear, neutral, conflict, decision } = payload;

  return await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: SYNTH_PROMPT,
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
