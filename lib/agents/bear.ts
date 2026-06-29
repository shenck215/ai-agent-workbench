import { safeChatCompletion } from "@/lib/ai/safeOpenAI";
import { BEAR_PROMPT } from "../prompts/version";

export async function bearAgent(input: string) {
  return await safeChatCompletion({
    messages: [
      {
        role: "system",
        content: BEAR_PROMPT,
      },
      { role: "user", content: input },
    ],
  });
}