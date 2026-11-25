"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Play, RotateCcw, Sparkles, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogStream } from "@/components/agent-execution";
import { CommandBar } from "@/components/command-bar";
import { AgentAvatar, Button, LiveDot } from "@/components/ui";
import { WorkflowResult } from "@/components/workspace-results";
import { agents, workflowById, workflows, type AgentId, type Workflow } from "@/data/agents";
import { cn, num } from "@/lib/format";
import { useSimulation, type SimStep } from "@/lib/simulation";

const ORCH = "#1c1d21";
const colorOf = (id?: string) => (id === "orchestrator" ? ORCH : agents.find((a) => a.id === id)?.color);
const labelOf = (id?: string) => (id === "orchestrator" ? "Orchestrator" : agents.find((a) => a.id === id)?.short ?? "");

const commandSuggestions = [
  { label: "Review shipment IMP-2026-048", task: "review-048" },
  { label: "Find my most expensive imports", task: "expensive-imports" },
  { label: "Identify shipments with potential delays", task: "delays" },
  { label: "Compare suppliers for industrial components", task: "suppliers" },
  { label: "Find potential buyers in Germany", task: "export" },
];

type AgentState = "idle" | "queued" | "working" | "complete";

export function WorkspaceView({ task }: { task?: string }) {
  const router = useRouter();
  const [wfId, setWfId] = useState<string | null>(task ?? null);
  const [runKey, setRunKey] = useState(0);
  const wf = wfId ? workflowById(wfId) : undefined;

  const current = useRef(wfId);
  current.current = wfId;

  // Pick up external ?task= changes (e.g. from the global command bar)
  useEffect(() => {
    const t = task;
    if (t && workflowById(t) && t !== current.current) {
      setWfId(t);
      setRunKey((k) => k + 1);
    }
  }, [task]);

  const launch = (id: string) => {
    current.current = id;
    setWfId(id);
    setRunKey((k) => k + 1);
    router.replace(`/workspace?task=${id}`, { scroll: false });
    setTimeout(() => document.getElementById("orchestration")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[20px] border border-line bg-white px-6 py-8 shadow-card sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_300px_at_50%_-10%,rgba(79,91,213,0.10),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(600px_220px_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-2 shadow-card">
            <LiveDot /> Orchestrator online · 6 agents ready
          </div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">Your AI Trade Operations Team</h1>
          <p className="mt-2 text-[15.5px] text-ink-3">Six specialized agents working together to simplify international trade.</p>
          <CommandBar className="mt-7 w-full text-left" suggestions={commandSuggestions} onRun={launch} placeholder="Give your AI team a task…" />
        </div>
      </section>

      {/* Orchestration */}
      <div id="orchestration" className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {wf ? (
            <motion.div key={`${wf.id}-${runKey}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <Orchestration wf={wf} onClose={() => { setWfId(null); router.replace("/workspace", { scroll: false }); }} onRestart={() => setRunKey((k) => k + 1)} />
            </motion.div>
          ) : (
            <motion.div key="agents-only" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
      </div>

      {/* Agent grid */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight">Agents</h2>
            <p className="text-[13px] text-ink-3">Run any agent on its own sample workflow</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a, i) => {
            const active = wf?.phases.some((p) => p.agent === a.id);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileHover={{ y: -2 }} className="card group flex flex-col p-5 transition-shadow hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <AgentAvatar agent={a.id} color={a.color} size={44} state={active ? "working" : "idle"} />
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", active ? "bg-brand-50 text-brand" : "bg-mint-50 text-mint")}>
                    <span className={cn("size-1.5 rounded-full", active ? "animate-pulse bg-brand" : "bg-mint")} />
                    {active ? "Assigned" : "Available"}
                  </span>
                </div>
                <div className="mt-4 text-[15px] font-semibold">{a.name}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{a.specialization}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <div className="text-[15px] font-semibold tabular">{num(a.tasksCompleted)}</div>
                    <div className="text-[11px] text-ink-3">tasks completed</div>
                  </div>
                  <Button size="sm" icon={Play} onClick={() => launch(a.defaultWorkflow)}>
                    Run Agent
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <div className="text-[13px] font-medium text-ink">All sample workflows</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {workflows.map((w) => (
            <button key={w.id} onClick={() => launch(w.id)} className="rounded-lg border border-line bg-canvas/50 px-3 py-2 text-left text-[13px] transition hover:border-brand/30 hover:bg-white cursor-pointer">
              <div className="font-medium text-ink">{w.command}</div>
              <div className="text-xs text-ink-3">{w.description}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const NODE_X = [90, 254, 418, 582, 746, 910];

function Orchestration({ wf, onClose, onRestart }: { wf: Workflow; onClose: () => void; onRestart: () => void }) {
  const steps: SimStep[] = useMemo(
    () => wf.phases.flatMap((p) => p.steps.map((s) => ({ ...s, agent: p.agent, task: p.task }))),
    [wf]
  );
  const sim = useSimulation(steps);
  useEffect(() => {
    sim.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const involved = new Set(wf.phases.map((p) => p.agent));
  const cur = steps[sim.step];
  const activeAgent = sim.status === "running" ? (cur?.agent as AgentId | undefined) : undefined;

  const stateOf = (id: AgentId): AgentState => {
    if (!involved.has(id)) return "idle";
    if (sim.status === "complete") return "complete";
    const idxs = steps.map((s, i) => (s.agent === id ? i : -1)).filter((i) => i >= 0);
    if (idxs.includes(sim.step)) return "working";
    if (sim.step > Math.max(...idxs)) return "complete";
    return "queued";
  };

  // phase progress for the side panel
  let cursor = 0;
  const phaseRows = wf.phases.map((p, pi) => {
    const from = cursor;
    cursor += p.steps.length;
    const to = cursor;
    const st: AgentState = sim.status === "complete" || sim.step >= to ? "complete" : sim.step >= from ? "working" : "queued";
    return { p, pi, from, st };
  });

  const pct = sim.status === "complete" ? 100 : (Math.max(sim.step, 0) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="card overflow-hidden">
        {/* header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-ink-4">
              {sim.status === "running" ? <><span className="size-1.5 animate-pulse rounded-full bg-brand" /> Running</> : <><Check className="size-3.5 text-mint" /> Completed</>}
            </div>
            <div className="mt-0.5 truncate text-[16px] font-semibold">“{wf.command}”</div>
          </div>
          {sim.status === "running" ? (
            <Button size="sm" variant="ghost" icon={Square} onClick={onClose}>Stop</Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
              <Button size="sm" icon={RotateCcw} onClick={onRestart}>Restart demo</Button>
            </>
          )}
        </div>
        <div className="h-[2px] bg-line/60">
          <motion.div className="h-full bg-brand" animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          {/* Graph */}
          <div className="relative border-b border-line bg-canvas/40 xl:border-b-0 xl:border-r">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
            <div className="relative aspect-[1000/360] w-full">
              <svg viewBox="0 0 1000 360" className="absolute inset-0 h-full w-full">
                {agents.map((a, i) => {
                  const x = NODE_X[i];
                  const d = `M500 92 C 500 180, ${x} 170, ${x} 250`;
                  const inv = involved.has(a.id);
                  const st = stateOf(a.id);
                  const on = st === "working";
                  return (
                    <g key={a.id}>
                      <path d={d} fill="none" stroke={inv ? `${a.color}40` : "#e6e3dd"} strokeWidth={inv ? 1.5 : 1} strokeDasharray={inv ? "0" : "3 5"} />
                      {(on || st === "complete") && (
                        <motion.path
                          d={d}
                          fill="none"
                          stroke={a.color}
                          strokeWidth={2}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6 }}
                          className={on ? "flow-line" : ""}
                        />
                      )}
                      {on && (
                        <circle r="4" fill={a.color}>
                          <animateMotion dur="1.2s" repeatCount="indefinite" path={d} />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Orchestrator */}
              <div className="absolute left-1/2 top-[6%] flex -translate-x-1/2 flex-col items-center">
                <AgentAvatar agent="orchestrator" color={ORCH} size={52} state={activeAgent === "orchestrator" ? "working" : sim.status === "complete" ? "complete" : "idle"} />
                <div className="mt-1.5 rounded-md bg-white/80 px-1.5 text-[12px] font-semibold text-ink backdrop-blur">Orchestrator</div>
              </div>

              {/* Agents */}
              {agents.map((a, i) => {
                const st = stateOf(a.id);
                return (
                  <motion.div
                    key={a.id}
                    className="absolute flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${NODE_X[i] / 10}%`, top: "69%" }}
                    animate={{ opacity: involved.has(a.id) ? 1 : 0.4, scale: st === "working" ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <AgentAvatar agent={a.id} color={a.color} size={40} state={st === "working" ? "working" : st === "complete" ? "complete" : "idle"} />
                    <div className="mt-1.5 hidden text-center sm:block">
                      <div className="text-[11.5px] font-medium text-ink">{a.short}</div>
                      <div className={cn("text-[10.5px]", st === "working" ? "text-brand" : st === "complete" ? "text-mint" : "text-ink-4")}>
                        {st === "working" ? "Working" : st === "complete" ? "Done" : st === "queued" ? "Queued" : "Standby"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* current task ticker */}
            <div className="relative flex h-12 items-center gap-3 border-t border-line bg-white/70 px-5 backdrop-blur">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sim.status === "complete" ? "done" : sim.step}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex min-w-0 items-center gap-2 text-[13px]"
                >
                  {sim.status === "complete" ? (
                    <>
                      <Sparkles className="size-4 text-mint" />
                      <span className="font-medium text-ink">Final recommendation generated</span>
                    </>
                  ) : cur ? (
                    <>
                      <span className="size-2 shrink-0 rounded-full" style={{ background: colorOf(cur.agent) }} />
                      <span className="shrink-0 font-medium text-ink">{labelOf(cur.agent)}</span>
                      <span className="truncate text-ink-3"><span className="shimmer-text">{cur.label}…</span></span>
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Phases + log */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 p-4">
              {phaseRows.map(({ p, pi, st }) => (
                <motion.div
                  key={pi}
                  layout
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    st === "working" && "bg-canvas"
                  )}
                >
                  <span className="grid size-5 shrink-0 place-items-center">
                    {st === "complete" ? (
                      <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="grid size-5 place-items-center rounded-full bg-mint">
                        <Check className="size-3 text-white" strokeWidth={3} />
                      </motion.span>
                    ) : st === "working" ? (
                      <span className="relative flex size-3">
                        <span className="absolute inset-0 animate-ping rounded-full opacity-50" style={{ background: colorOf(p.agent) }} />
                        <span className="relative size-3 rounded-full" style={{ background: colorOf(p.agent) }} />
                      </span>
                    ) : (
                      <span className="size-3 rounded-full border-2 border-line-strong" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[13px]", st === "queued" ? "text-ink-4" : "text-ink font-medium")}>
                      {p.agent === "orchestrator" ? (pi === 0 ? "Orchestrator · planning" : "Results consolidated") : `${agents.find((a) => a.id === p.agent)?.name} agent activated`}
                    </div>
                    <div className="truncate text-xs text-ink-3">{p.task}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex min-h-[200px] flex-1 flex-col border-t border-line bg-canvas/60">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Execution log</span>
                <span className="text-[11px] text-ink-3 tabular">{sim.logs.length} events</span>
              </div>
              <div className="h-[220px] min-h-0">
                <LogStream logs={sim.logs} running={sim.status === "running"} colorFor={colorOf} labelFor={labelOf} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sim.status === "complete" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <h3 className="text-[16px] font-semibold tracking-tight">Consolidated output</h3>
              <span className="text-[13px] text-ink-3">· {involved.size - 1} agent{involved.size - 1 > 1 ? "s" : ""} · {steps.length} steps · {(sim.totalMs / 1000).toFixed(1)}s</span>
            </div>
            <WorkflowResult kind={wf.result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
