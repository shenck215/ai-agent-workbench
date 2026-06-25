export function getStockTool(symbol: string) {
  const db: Record<string, object> = {
    AAPL: { price: 180, pe: 28, trend: "up" },
    TSLA: { price: 240, pe: 65, trend: "volatile" },
  };

  return db[symbol] || { price: 100, pe: 20, trend: "unknown" };
}