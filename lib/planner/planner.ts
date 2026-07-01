export type Plan = {
  useRag: boolean;
  useTools: boolean;
  agents: ("bull" | "bear" | "neutral")[];
};

export function createPlan(input: string): Plan {
  const isStock = /AAPL|TSLA|stock|price/i.test(input);
  const isMath = /[0-9]+\+|calculate|compute/i.test(input);

  return {
    useRag: isStock,
    useTools: isMath || isStock,
    agents: ["bull", "bear", "neutral"],
  };
}