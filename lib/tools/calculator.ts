export function calculatorTool(input: string) {
  try {
    // ⚠️ demo 用，生产不要这样写
    const result = Function(`return (${input})`)();
    return String(result);
  } catch (e) {
    return "calculator error";
  }
}