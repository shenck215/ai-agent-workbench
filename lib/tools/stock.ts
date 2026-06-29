export function getStockTool(symbol: string) {
  type StockSnapshot = {
    price: number;
    pe: number;
  };

  const db: Record<string, StockSnapshot> = {
    AAPL: { price: 180, pe: 28 },
    TSLA: { price: 240, pe: 65 },
  };

  return db[symbol] || { price: 100, pe: 20 };
}
