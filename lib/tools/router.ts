import { calculatorTool } from "./calculator";
import { getStockTool } from "./stock";

export function runTool(toolCall: string) {
  // format: calculator:2+3
  if (toolCall.startsWith("calculator:")) {
    return calculatorTool(toolCall.replace("calculator:", ""));
  }

  // format: stock:AAPL
  if (toolCall.startsWith("stock:")) {
    return getStockTool(toolCall.replace("stock:", ""));
  }

  return "unknown tool";
}