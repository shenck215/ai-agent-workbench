import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { NEUTRAL_PROMPT } from "../prompts/version";

export async function neutralAgent(input: string) {
  return await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: NEUTRAL_PROMPT,
      },
      { role: "user", content: input },
    ],
  });
}