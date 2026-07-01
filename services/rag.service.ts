import { queryStock } from "@/lib/rag/query";
import { log } from "@/lib/telemetry/logger";

export async function runRag(input: string) {
  const rag = queryStock(input);

  log({ type: "rag", input, output: rag });

  return rag;
}
