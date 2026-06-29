import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function safeChatCompletion({
  messages,
  model = "gpt-4.1-mini",
  retries = 2,
  timeout = 12000,
}: {
  messages: ChatCompletionMessageParam[];
  model?: string;
  retries?: number;
  timeout?: number;
}): Promise<string | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout)
      );

      const res = await Promise.race([
        client.chat.completions.create({
          model,
          messages,
        }),
        timeoutPromise,
      ]);

      return res.choices[0]?.message.content ?? null;
    } catch (e) {
      console.log(`[AI retry ${i + 1}/${retries}]`, e);

      if (i === retries) return null;
    }
  }

  return null;
}
