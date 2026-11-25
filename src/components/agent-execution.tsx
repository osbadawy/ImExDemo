"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { AgentId } from "@/data/agents";
import { cn } from "@/lib/format";
import { useSimulation, type SimLog, type SimStep } from "@/lib/simulation";
import { AgentAvatar, Button } from "./ui";

export interface AgentExecutionProps {
  agentName: string;
  agent: AgentId;
  color?: string;
  task: string;
  steps: SimStep[];
  result?: ReactNode;
  autoStart?: boolean;
  speed?: number;
  onComplete?: () => void;
  onRestart?: () => void;
  className?: string;
}

const fmtT = (ms: number) => `00:${String(Math.floor(ms / 1000)).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;

export function LogStream({
  logs,
  running,
  colorFor,
  labelFor,
}: {
  logs: SimLog[];
  running: boolean;
  colorFor?: (agent?: string) => string | undefined;
  labelFor?: (agent?: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [logs.length]);
  return (
    <div ref={ref} className="scrollbar-thin h-full overflow-y-auto px-4 py-3 font-mono text-[12px] leading-[1.7]">
      {logs.length === 0 && !running && <div className="text-ink-4">Waiting for task…</div>}
      <AnimatePresence initial={false}>
        {logs.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-3"
          >
            <span className="shrink-0 text-ink-4 tabular">{fmtT(l.at)}</span>
            {l.agent && labelFor && (
              <span className="w-[84px] shrink-0 truncate font-medium" style={{ color: colorFor?.(l.agent) }}>
                {labelFor(l.agent)}
              </span>
            )}
            <span className="text-ink-2">{l.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {running && (
        <div className="flex items-center gap-1.5 pt-1 text-ink-4">
          <span className="tabular">{"  "}</span>
          <motion.span
            className="inline-block h-3.5 w-[7px] bg-brand/60"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  );
}

export function StepList({ steps, current, color = "#4f5bd5" }: { steps: SimStep[]; current: number; color?: string }) {
  return (
    <ol className="relative flex flex-col">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span className="absolute left-[9px] top-6 bottom-0 w-[2px] overflow-hidden rounded-full bg-line">
                <motion.span
                  className="absolute inset-x-0 top-0 block rounded-full"
                  style={{ background: color }}
                  initial={{ height: "0%" }}
                  animate={{ height: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </span>
            )}
            <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
              {done ? (
                <motion.span
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="grid size-5 place-items-center rounded-full"
                  style={{ background: color }}
                >
                  <Check className="size-3 text-white" strokeWidth={3} />
                </motion.span>
              ) : active ? (
                <span className="relative grid size-5 place-items-center rounded-full border-2" style={{ borderColor: color }}>
                  <motion.span
                    className="size-2 rounded-full"
                    style={{ background: color }}
                    animate={{ scale: [1, 0.6, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </span>
              ) : (
                <span className="size-5 rounded-full border-2 border-line bg-white" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-[13.5px] transition-colors",
                  done && "text-ink",
                  active && "font-medium",
                  !done && !active && "text-ink-4"
                )}
              >
                {active ? <span className="shimmer-text">{s.label}…</span> : s.label}
              </div>
              {active && (
                <div className="mt-2 h-[3px] w-full max-w-[220px] overflow-hidden rounded-full bg-line">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: s.ms / 1000, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Reusable agent execution panel: streams steps & logs from the shared
 * simulation engine, then reveals the final result.
 */
export function AgentExecution({
  agentName,
  agent,
  color = "#4f5bd5",
  task,
  steps,
  result,
  autoStart = true,
  speed,
  onComplete,
  onRestart,
  className,
}: AgentExecutionProps) {
  const sim = useSimulation(steps, { onComplete, speed });
  const { status, step, logs, start, reset } = sim;

  useEffect(() => {
    if (autoStart) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const pct = status === "complete" ? 100 : step < 0 ? 0 : (step / steps.length) * 100;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <motion.div layout className="card overflow-hidden">
        {/* header */}
        <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
          <AgentAvatar agent={agent} color={color} state={status === "running" ? "working" : status === "complete" ? "complete" : "idle"} size={42} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{agentName}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  status === "running" && "bg-brand-50 text-brand",
                  status === "complete" && "bg-mint-50 text-mint",
                  status === "idle" && "bg-ink/[0.04] text-ink-3"
                )}
              >
                {status === "running" && <span className="size-1.5 animate-pulse rounded-full bg-brand" />}
                {status === "running" ? `Working · step ${Math.min(step + 1, steps.length)} of ${steps.length}` : status === "complete" ? "Complete" : "Idle"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[13px] text-ink-3">{task}</p>
          </div>
          {status === "idle" && (
            <Button variant="primary" icon={Sparkles} onClick={start}>
              Run agent
            </Button>
          )}
          {status === "complete" && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                reset();
                onRestart?.();
                setTimeout(start, 50);
              }}
            >
              Run again
            </Button>
          )}
        </div>
        <div className="h-[2px] bg-line/60">
          <motion.div className="h-full" style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>

        <AnimatePresence initial={false}>
          {status !== "complete" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="p-5">
                  <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-ink-4">Execution plan</div>
                  <StepList steps={steps} current={step} color={color} />
                </div>
                <div className="flex h-[300px] flex-col border-t border-line bg-canvas/60 md:border-l md:border-t-0">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Live activity</span>
                    {status === "running" && (
                      <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
                        <span className="size-1.5 animate-pulse rounded-full bg-mint" /> streaming
                      </span>
                    )}
                  </div>
                  <div className="min-h-0 flex-1">
                    <LogStream logs={logs} running={status === "running"} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {status === "complete" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-[13px] text-ink-3">
            <span className="flex items-center gap-1.5 text-mint">
              <Check className="size-4" strokeWidth={2.2} /> {steps.length} steps completed
            </span>
            <span>{logs.length} checks performed</span>
            <span>Duration {(sim.totalMs / 1000).toFixed(1)}s</span>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {status === "complete" && result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
