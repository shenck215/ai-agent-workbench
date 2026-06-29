# 多 Agent 投研系统
Built a production-grade multi-agent AI decision system with separated product layer and developer observability layer.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Wrokflow
Product UI Layer
   ↓
Synth (AI explanation engine)
   ↓
Decision engine
   ↓
Multi-Agent system
   ↓
Tool system
   ↓
Logging system (replayable)