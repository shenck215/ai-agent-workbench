export function calculatorTool(expr: string) {
  try {
    const safe = /^[0-9+\-*/().\s]+$/.test(expr);
    if (!safe) return "invalid expression";

    const result = new Function(`return (${expr})`)();

    return String(result);
  } catch {
    return "calc error";
  }
}
