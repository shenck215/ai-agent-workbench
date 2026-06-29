import { calculatorTool } from "./calculator";
import { getStockTool } from "./stock";

export function runTool(tool: string | null) {
  if (!tool) return null;

  if (tool.startsWith("calculator:")) {
    return calculatorTool(tool.replace("calculator:", ""));
  }

  if (tool.startsWith("stock:")) {
    return getStockTool(tool.replace("stock:", ""));
  }

  return null;
}