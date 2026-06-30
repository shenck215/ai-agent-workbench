import {
  stockKnowledge,
  type StockKnowledgeKey,
} from "@/lib/rag/stockKnowledge";

type StockSnapshot = {
  price: number;
  pe: number;
  updatedAt: string;
};

const stockSnapshots = {
  AAPL: {
    price: 180,
    pe: 28,
    updatedAt: "2026-06-30",
  },
  TSLA: {
    price: 240,
    pe: 65,
    updatedAt: "2026-06-30",
  },
} satisfies Record<StockKnowledgeKey, StockSnapshot>;

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function isStockKnowledgeKey(symbol: string): symbol is StockKnowledgeKey {
  return symbol in stockKnowledge;
}

export function getStockTool(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!isStockKnowledgeKey(normalizedSymbol)) {
    return {
      ok: false,
      symbol: normalizedSymbol,
      error: "unsupported_symbol",
      message: "No local stock snapshot is available for this symbol.",
    };
  }

  return {
    ok: true,
    symbol: normalizedSymbol,
    source: "local_demo_snapshot",
    snapshot: stockSnapshots[normalizedSymbol],
    profile: stockKnowledge[normalizedSymbol],
  };
}
