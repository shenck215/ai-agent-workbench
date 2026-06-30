import { getEval } from "@/lib/eval/evaluator";

/**
 * 基于历史表现动态优化 prompt
 */
export function optimizePrompt(basePrompt: string) {
  const evals = getEval();

  if (evals.length < 10) return basePrompt;

  const recent = evals.slice(-20);

  const bullAvg =
    recent.reduce((a, b) => a + b.bullConfidence, 0) /
    recent.length;

  const bearAvg =
    recent.reduce((a, b) => a + b.bearConfidence, 0) /
    recent.length;

  if (bullAvg > bearAvg) {
    return basePrompt + "\n（系统提示：近期偏乐观，请加强风险分析）";
  }

  return basePrompt + "\n（系统提示：近期偏谨慎，请加强机会识别）";
}