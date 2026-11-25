"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SimStatus = "idle" | "running" | "complete";

export interface SimStep {
  label: string;
  logs: string[];
  ms: number;
  agent?: string;
  task?: string;
}

export interface SimLog {
  id: number;
  text: string;
  step: number;
  agent?: string;
  at: number; // ms from start
}

/**
 * Deterministic simulation engine: walks through predefined steps on timers,
 * streams log lines inside each step and reports status transitions.
 * All timers are cleared on reset and on unmount.
 */
export function useSimulation(steps: SimStep[], opts?: { onComplete?: () => void; speed?: number }) {
  const [status, setStatus] = useState<SimStatus>("idle");
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState<SimLog[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onComplete = useRef(opts?.onComplete);
  onComplete.current = opts?.onComplete;
  const speed = opts?.speed ?? 1;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clear, []);

  const reset = useCallback(() => {
    clear();
    setStatus("idle");
    setStep(-1);
    setLogs([]);
  }, []);

  const start = useCallback(() => {
    clear();
    setStatus("running");
    setStep(0);
    setLogs([]);
    let t = 0;
    let id = 0;
    steps.forEach((s, i) => {
      const dur = s.ms * speed;
      const begin = t;
      timers.current.push(setTimeout(() => setStep(i), begin));
      s.logs.forEach((text, j) => {
        const at = begin + (dur * (j + 0.6)) / (s.logs.length + 0.4);
        const logId = id++;
        timers.current.push(
          setTimeout(() => setLogs((l) => [...l, { id: logId, text, step: i, agent: s.agent, at }]), at)
        );
      });
      t += dur;
    });
    timers.current.push(
      setTimeout(() => {
        setStep(steps.length);
        setStatus("complete");
        onComplete.current?.();
      }, t + 250)
    );
  }, [steps, speed]);

  const totalMs = steps.reduce((a, s) => a + s.ms * speed, 0);

  return { status, step, logs, start, reset, totalMs, steps };
}
