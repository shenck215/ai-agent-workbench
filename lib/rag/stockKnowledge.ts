export type StockKnowledgeKey = "AAPL" | "TSLA";

export type StockKnowledgeProfile = {
  name: string;
  aliases: string[];
  industry: string;
  moat: string;
  risk: string;
};

export const stockKnowledge: Record<StockKnowledgeKey, StockKnowledgeProfile> = {
  AAPL: {
    name: "Apple",
    aliases: ["苹果"],
    industry: "消费电子",
    moat: "生态系统 + 品牌 + 服务收入",
    risk: "增长放缓",
  },

  TSLA: {
    name: "Tesla",
    aliases: ["特斯拉"],
    industry: "新能源车",
    moat: "技术领先 + 品牌",
    risk: "估值波动大",
  },
};
