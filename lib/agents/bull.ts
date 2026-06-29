import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { BULL_PROMPT } from "../prompts/version";

export async function bullAgent(input: string) {
  return await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: BULL_PROMPT,
      },
      { role: "user", content: input },
    ],
  });
}