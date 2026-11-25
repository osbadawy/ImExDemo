# TradeFlow AI — AI-native trade operations demo

An interactive, frontend-only product demo of an AI operating system for Egyptian import/export companies. The demo company is **Nile Industrial Trading** (Cairo). It imports industrial machinery and electronic components and exports furniture and fabricated metal.

> All data, AI agents and integrations are **simulated**. There is no backend, no real LLM, and nothing is sent to customs, banking or shipping systems. Tariff, tax and FX values are hypothetical, user-editable assumptions.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed.

```bash
npm run build   # production build + type check
npm start       # serve the production build
```

## Suggested demo path (≈ 5 minutes)

1. **Overview** (`/`): KPIs, shipment activity, and the three AI Insights.
2. Click **"Potential document discrepancy detected"**. This opens **Document Intelligence** for `IMP-2026-048`.
3. Click **Analyze Documents with AI** and watch the agent read the five documents (about 8 seconds).
4. Review the report: one confirmed quantity mismatch (850 vs 800 units) and two items that need professional verification.
5. Click **Generate Supplier Email**. You can copy the draft, mark it reviewed, or approve it (simulated, nothing is sent).
6. Open **Cost Intelligence** (`/costs`). Move the FX, freight, duty and port-fee sliders, then click **Run AI Cost Optimization**.
7. Open the **AI Workspace** (`/workspace`) and run **"Review shipment IMP-2026-048"**. The orchestrator routes the task to the Document, Logistics and Financial agents and merges their results.
8. Try the other agents: Procurement (supplier comparison), Export Growth (market scores, demo buyers, outreach email), Logistics (delay risks) and Compliance (checklist).

## Structure

```
src/
  app/                 Routes: overview, shipments (+ [id]), documents, costs, workspace, settings
  components/
    agent-execution.tsx   Reusable AgentExecution panel (steps, live log, result reveal)
    workspace-results.tsx Structured outputs for each agent workflow
    shell.tsx             Collapsible sidebar, top bar, global search, notifications
    ui.tsx                Design-system primitives
  data/
    index.ts           Shipments, suppliers, buyers, documents, timelines, landed-cost model
    agents.ts          Agent profiles, workflow scripts, result datasets
  lib/
    simulation.ts      useSimulation(): timer-driven, deterministic execution engine
    shipment-analysis.ts  Per-shipment mock analysis
```

### Simulation engine

`useSimulation(steps)` walks through `{ label, logs[], ms, agent? }` steps on timers. It streams the log lines within each step, moves the status from `idle` to `running` to `complete`, and clears every timer on reset or unmount. `AgentExecution`, the document analysis and the multi-agent orchestrator all run on this engine.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Lucide icons
