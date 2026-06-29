export type MemoryItem = {
  input: string;
  decision: string;
  timestamp: number;
  tags: string[];
};

const MAX_MEMORY_ITEMS = 50;
const memory: MemoryItem[] = [];

export function saveMemory(item: MemoryItem) {
  memory.push(item);

  if (memory.length > MAX_MEMORY_ITEMS) {
    memory.splice(0, memory.length - MAX_MEMORY_ITEMS);
  }
}

function tokenize(value: string) {
  return value.toUpperCase().match(/[A-Z0-9]+|[\u4E00-\u9FFF]+/g) ?? [];
}

function scoreMemory(query: string, item: MemoryItem) {
  const queryTokens = new Set(tokenize(query));
  const itemTokens = new Set([
    ...tokenize(item.input),
    ...item.tags.flatMap(tokenize),
  ]);
  let score = 0;

  for (const token of queryTokens) {
    if (token.length < 2) continue;
    if (itemTokens.has(token)) score += 2;
    if (item.input.toUpperCase().includes(token)) score += 1;
  }

  return score;
}

export function getMemory(input: string, limit = 5) {
  return memory
    .map((item) => ({
      item,
      score: scoreMemory(input, item),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.timestamp - a.item.timestamp)
    .slice(0, limit)
    .map(({ item }) => item);
}
