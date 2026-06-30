type EvalRecord = {
  input: string;
  decision: string;
  actual?: string; // 后续可人工/市场结果回填
  bullConfidence: number;
  bearConfidence: number;
};

const evalStore: EvalRecord[] = [];

export function recordEval(record: EvalRecord) {
  evalStore.push(record);
}

export function getEval() {
  return evalStore;
}