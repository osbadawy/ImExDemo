"use client";

import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { matchWorkflow } from "@/lib/match";
import { cn } from "@/lib/format";

export const defaultSuggestions = [
  { label: "Review my shipment documents", task: "documents" },
  { label: "Analyze my import costs", task: "expensive-imports" },
  { label: "Find shipments at risk", task: "delays" },
  { label: "Compare my suppliers", task: "suppliers" },
];

export function CommandBar({
  suggestions = defaultSuggestions,
  onRun,
  placeholder = "Ask TradeFlow AI anything about your operations…",
  className,
}: {
  suggestions?: { label: string; task: string }[];
  onRun?: (task: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [focus, setFocus] = useState(false);
  const router = useRouter();
  const run = (task: string) => {
    if (onRun) onRun(task);
    else router.push(`/workspace?task=${task}`);
    setValue("");
  };
  return (
    <div className={cn("relative", className)}>
      <motion.div
        animate={{ boxShadow: focus ? "0 0 0 4px rgba(79,91,213,0.10), 0 12px 32px -12px rgba(28,29,33,0.18)" : "0 1px 2px rgba(28,29,33,0.04), 0 8px 24px -12px rgba(28,29,33,0.10)" }}
        className={cn("relative overflow-hidden rounded-2xl border bg-white transition-colors", focus ? "border-brand/40" : "border-line")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_120px_at_0%_0%,rgba(79,91,213,0.06),transparent)]" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) run(matchWorkflow(value));
          }}
          className="relative flex items-center gap-3 px-4 py-3.5"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand to-[#7d89f0] text-white shadow-sm">
            <Sparkles className="size-4" strokeWidth={2} />
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 outline-none"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="grid size-8 place-items-center rounded-lg bg-ink text-white transition disabled:bg-line disabled:text-ink-4 cursor-pointer"
            aria-label="Run"
          >
            <ArrowUp className="size-4" strokeWidth={2.2} />
          </button>
        </form>
      </motion.div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i + 0.2 }}
            onClick={() => run(s.task)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink-2 shadow-card transition hover:border-brand/30 hover:text-brand cursor-pointer"
          >
            {s.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
