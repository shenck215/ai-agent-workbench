import {
  stockKnowledge,
  type StockKnowledgeKey,
  type StockKnowledgeProfile,
} from "./stockKnowledge";

export type StockKnowledgeHit = {
  symbol: StockKnowledgeKey;
} & StockKnowledgeProfile;

const symbols = Object.keys(stockKnowledge) as StockKnowledgeKey[];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTicker(input: string, symbol: StockKnowledgeKey) {
  return new RegExp(`(^|[^A-Z0-9])${escapeRegExp(symbol)}([^A-Z0-9]|$)`).test(
    input.toUpperCase(),
  );
}

export function queryStock(input: string): StockKnowledgeHit | null {
  const normalizedInput = input.trim().toLowerCase();

  if (!normalizedInput) return null;

  for (const symbol of symbols) {
    const profile = stockKnowledge[symbol];
    const aliases = [profile.name, ...profile.aliases];

    if (
      containsTicker(input, symbol) ||
      aliases.some((alias) => normalizedInput.includes(alias.toLowerCase()))
    ) {
      return {
        symbol,
        ...profile,
      };
    }
  }

  return null;
}
