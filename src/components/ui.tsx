"use client";

import { motion } from "framer-motion";
import {
  Bot,
  FileSearch,
  Globe2,
  Handshake,
  LineChart,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/format";
import type { DocStatus, RiskLevel, ShipmentStatus } from "@/data/types";
import type { AgentId } from "@/data/agents";
import { stages } from "@/data";

/* Buttons ----------------------------------------------------------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
};

export function Button({ variant = "secondary", size = "md", icon: Icon, className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-9 px-3.5 text-sm",
        size === "lg" && "h-11 px-5 text-[15px]",
        variant === "primary" &&
          "bg-brand text-white shadow-[0_1px_2px_rgba(79,91,213,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-brand-600",
        variant === "dark" && "bg-ink text-white hover:bg-ink/90 shadow-sm",
        variant === "secondary" && "bg-white border border-line text-ink hover:border-line-strong hover:bg-canvas/60 shadow-card",
        variant === "ghost" && "text-ink-2 hover:bg-ink/[0.04] hover:text-ink",
        className
      )}
    >
      {Icon && <Icon className={cn(size === "lg" ? "size-[18px]" : "size-4")} strokeWidth={1.8} />}
      {children}
    </button>
  );
}

/* Status & risk ----------------------------------------------------- */

const statusStyles: Record<ShipmentStatus, string> = {
  Booked: "bg-ink/[0.04] text-ink-2",
  "In Transit": "bg-brand-50 text-brand",
  "At Port": "bg-[#e9f2fb] text-[#2f6fae]",
  "Customs Clearance": "bg-[#f3eefb] text-[#7a52c0]",
  "Action Required": "bg-rose-50 text-rose",
  Delivered: "bg-mint-50 text-mint",
};

export function StatusPill({ status }: { status: ShipmentStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", statusStyles[status])}>
      {status}
    </span>
  );
}

export function RiskIndicator({ risk, label = true }: { risk: RiskLevel; label?: boolean }) {
  const bars = risk === "low" ? 1 : risk === "medium" ? 2 : 3;
  const color = risk === "low" ? "bg-mint" : risk === "medium" ? "bg-amber" : "bg-rose";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => (
          <span key={b} className={cn("w-[3px] rounded-full", b <= bars ? color : "bg-line-strong")} style={{ height: 4 + b * 3 }} />
        ))}
      </span>
      {label && <span className="text-xs text-ink-2 capitalize">{risk}</span>}
    </span>
  );
}

export function DocStatusPill({ status }: { status: DocStatus }) {
  const m: Record<DocStatus, [string, string]> = {
    verified: ["Verified", "bg-mint-50 text-mint"],
    "in-review": ["Pending review", "bg-ink/[0.04] text-ink-2"],
    issue: ["Issue found", "bg-rose-50 text-rose"],
    missing: ["Missing", "bg-amber-50 text-amber"],
  };
  const [l, c] = m[status];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", c)}>{l}</span>;
}

/* Cards ------------------------------------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, action, icon: Icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-canvas border border-line">
            <Icon className="size-3.5 text-ink-2" strokeWidth={1.8} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-3">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* Sparkline --------------------------------------------------------- */

export function Sparkline({ data, color = "#4f5bd5", height = 32, width = 96 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - 3 - ((d - min) / (max - min || 1)) * (height - 6)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const gid = `sg-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={`${path} L${width},${height} L0,${height} Z`}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r={2.5}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2 }}
      />
    </svg>
  );
}

/* Progress tracker -------------------------------------------------- */

export function StageProgress({ stage, compact = false, warn = false }: { stage: number; compact?: boolean; warn?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {stages.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 w-4 rounded-full",
              i < stage ? "bg-brand" : i === stage ? (warn ? "bg-rose" : "bg-brand/50") : "bg-line"
            )}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-[11px] mx-[11px] h-[2px] bg-line" />
      <motion.div
        className="absolute left-0 top-[11px] ml-[11px] h-[2px] bg-brand"
        initial={{ width: 0 }}
        animate={{ width: `calc(${(stage / (stages.length - 1)) * 100}% - ${(stage / (stages.length - 1)) * 22}px)` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="relative flex justify-between">
        {stages.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              className={cn(
                "grid size-[24px] place-items-center rounded-full border-2 bg-white",
                i < stage && "border-brand bg-brand",
                i === stage && (warn ? "border-rose" : "border-brand"),
                i > stage && "border-line"
              )}
            >
              {i < stage ? (
                <svg viewBox="0 0 12 12" className="size-3 text-white">
                  <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i === stage ? (
                <span className={cn("size-2 rounded-full animate-pulse", warn ? "bg-rose" : "bg-brand")} />
              ) : null}
            </motion.div>
            <span className={cn("text-xs", i <= stage ? "text-ink font-medium" : "text-ink-3")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Agent avatar ------------------------------------------------------ */

export const agentIcons: Record<AgentId, LucideIcon> = {
  orchestrator: Bot,
  document: FileSearch,
  financial: LineChart,
  logistics: Truck,
  procurement: Handshake,
  compliance: ShieldCheck,
  export: Globe2,
};

export function AgentAvatar({
  agent,
  color = "#4f5bd5",
  state = "idle",
  size = 40,
}: {
  agent: AgentId;
  color?: string;
  state?: "idle" | "working" | "complete";
  size?: number;
}) {
  const Icon = agentIcons[agent];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {state === "working" && (
        <>
          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{ background: color }}
            animate={{ scale: [1, 1.35], opacity: [0.25, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{ background: color }}
            animate={{ scale: [1, 1.35], opacity: [0.2, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
          />
        </>
      )}
      <div
        className="relative grid h-full w-full place-items-center rounded-xl border transition-colors duration-500"
        style={{
          background: state === "idle" ? "#fff" : `${color}14`,
          borderColor: state === "idle" ? "var(--color-line)" : `${color}55`,
        }}
      >
        <Icon style={{ color: state === "idle" ? "var(--color-ink-2)" : color, width: size * 0.45, height: size * 0.45 }} strokeWidth={1.7} />
      </div>
      {state === "complete" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-mint ring-2 ring-white"
        >
          <svg viewBox="0 0 12 12" className="size-2.5 text-white">
            <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LiveDot({ color = "bg-mint" }: { color?: string }) {
  return (
    <span className="relative flex size-2">
      <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", color)} />
      <span className={cn("relative inline-flex size-2 rounded-full", color)} />
    </span>
  );
}
