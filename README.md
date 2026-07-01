# Multi-Agent Investment Research System

Designed a modular AI agent system with planner-based orchestration, separated service layers, and decoupled reasoning/execution/synthesis pipeline.

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

## Workflow

```text
Product UI Layer
  -> POST /api/agents
  -> Planner
  -> Orchestration Bus
  -> Agents + Tools + RAG
  -> Memory Store
  -> Decision Engine + Conflict Detection
  -> Synth Layer
  -> Logging system
```
