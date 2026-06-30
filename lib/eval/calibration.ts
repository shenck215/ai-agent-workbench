import { getEval } from "./evaluator";

/**
 * confidence 校准（简单学习版）
 */
export function adjustConfidence(agent: "bull" | "bear") {
  const records = getEval();

  if (records.length < 5) return 1;

  const recent = records.slice(-20);

  const avg =
    agent === "bull"
      ? recent.reduce((a, b) => a + b.bullConfidence, 0) /
        recent.length
      : recent.reduce((a, b) => a + b.bearConfidence, 0) /
        recent.length;

  if (avg > 0.8) return 1.1;
  if (avg < 0.4) return 0.9;

  return 1;
}