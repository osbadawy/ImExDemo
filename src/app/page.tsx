"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  FileWarning,
  PiggyBank,
  Ship,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommandBar } from "@/components/command-bar";
import { ShipmentTable } from "@/components/shipment-table";
import { AgentAvatar, Button, Card, CardHeader, LiveDot, Sparkline } from "@/components/ui";
import { company, featuredShipmentIds, getShipment, insights, kpis } from "@/data";
import { agents } from "@/data/agents";
import { cn } from "@/lib/format";

const ActivityChart = dynamic(() => import("@/components/activity-chart"), { ssr: false });

const kpiIcons = { active: Ship, attention: AlertTriangle, value: Wallet, avoided: PiggyBank };
const kpiColors = { active: "#4f5bd5", attention: "#c27c0e", value: "#2f80c8", avoided: "#12a594" };

const insightMeta = {
  document: { icon: FileWarning, color: "text-rose", bg: "bg-rose-50", why: "Customs authorities compare declared quantities across all shipping documents. A mismatch can trigger an inspection hold on arrival at Ain Sokhna on 2 Dec." },
  deadline: { icon: Clock, color: "text-amber", bg: "bg-amber-50", why: "Two 20' containers have been at Alexandria terminal since 18 Nov. After 26 Nov, storage and demurrage charges accrue daily until release." },
  freight: { icon: TrendingDown, color: "text-mint", bg: "bg-mint-50", why: "A sample quotation from an alternative carrier on the Shanghai → Alexandria lane is $11,350 versus the booked $14,200 for 2 × 40' HC." },
};

const agentFeed = [
  { agent: "document" as const, text: "Flagged 3 items on IMP-2026-048", time: "12m" },
  { agent: "logistics" as const, text: "Free-time alert for IMP-2026-032", time: "1h" },
  { agent: "financial" as const, text: "New lower freight quote matched to IMP-2026-051", time: "3h" },
  { agent: "compliance" as const, text: "HS code review queued for 2 shipments", time: "5h" },
  { agent: "export" as const, text: "3 new buyer profiles in Germany", time: "Yesterday" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function OverviewPage() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const recent = featuredShipmentIds.map((id) => getShipment(id)!).slice(0, 7);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-[20px] border border-line bg-white px-6 py-7 shadow-card sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_260px_at_100%_0%,rgba(79,91,213,0.08),transparent),radial-gradient(500px_200px_at_0%_100%,rgba(18,165,148,0.06),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-grid opacity-60 [mask-image:linear-gradient(to_left,black,transparent)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-2 shadow-card">
              <LiveDot /> 6 AI agents available
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[34px]">
              <span suppressHydrationWarning>{greeting()}</span>, {company.user.first}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-2 max-w-[520px] text-[15.5px] leading-relaxed text-ink-3">
              Your international trade operations are looking healthy. Here&apos;s what needs your attention.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <CommandBar />
          </motion.div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = kpiIcons[k.id as keyof typeof kpiIcons];
          const color = kpiColors[k.id as keyof typeof kpiColors];
          return (
            <motion.button
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i + 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => router.push(k.id === "avoided" ? "/costs" : k.id === "attention" ? "/shipments?filter=attention" : "/shipments")}
              className="card group cursor-pointer p-5 text-left transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-3">{k.label}</span>
                <span className="grid size-7 place-items-center rounded-lg" style={{ background: `${color}12` }}>
                  <Icon className="size-3.5" style={{ color }} strokeWidth={2} />
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular">{k.value}</div>
                  <div className={cn("mt-2 text-xs font-medium", k.trend === "warn" ? "text-amber" : k.trend === "good" ? "text-mint" : "text-ink-3")}>
                    {k.trend === "up" && <ArrowUpRight className="mr-0.5 inline size-3.5" />}
                    {k.delta}
                  </div>
                </div>
                <Sparkline data={k.spark} color={color} />
              </div>
            </motion.button>
          );
        })}
      </section>

      {/* AI insights */}
      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-50/70 to-transparent" />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-[#7d89f0] text-white shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">AI Insights</h2>
              <p className="text-[13px] text-ink-3">Generated 12 minutes ago from 24 shipments and 118 documents</p>
            </div>
          </div>
          <Link href="/workspace" className="hidden items-center gap-1 text-[13px] font-medium text-brand hover:underline sm:flex">
            Open AI Workspace <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="relative grid gap-3 px-5 pb-5 lg:grid-cols-3">
          {insights.map((ins, i) => {
            const m = insightMeta[ins.kind];
            const expanded = open === ins.id;
            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className="group flex flex-col rounded-xl border border-line bg-white p-4 transition hover:border-line-strong hover:shadow-lift"
              >
                <div className="flex items-start gap-3">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", m.bg)}>
                    <m.icon className={cn("size-4", m.color)} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold leading-snug text-ink">{ins.title}</div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{ins.body}</p>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-11 text-[13px] leading-relaxed text-ink-2"
                    >
                      <span className="mt-3 block rounded-lg bg-canvas p-3">{m.why}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="mt-4 flex items-center justify-between pl-11">
                  <span className={cn("text-xs font-medium", ins.severity === "high" ? "text-rose" : "text-mint")}>{ins.impact}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setOpen(expanded ? null : ins.id)} className="grid size-7 place-items-center rounded-md text-ink-3 hover:bg-canvas cursor-pointer" aria-label="Details">
                      <ChevronDown className={cn("size-4 transition", expanded && "rotate-180")} />
                    </button>
                    <Button size="sm" variant={i === 0 ? "primary" : "secondary"} onClick={() => router.push(ins.href)}>
                      {ins.cta}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Chart + agent feed */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Shipment activity"
            subtitle="Weekly incoming and outgoing shipments, Sep – Dec 2026"
            action={
              <div className="hidden items-center gap-4 text-xs text-ink-3 sm:flex">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" /> Incoming</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-mint" /> Outgoing</span>
              </div>
            }
          />
          <div className="h-[260px] px-3 pb-4">
            <ActivityChart />
          </div>
        </Card>
        <Card>
          <CardHeader title="Agent activity" subtitle="Latest autonomous actions" action={<LiveDot />} />
          <div className="flex flex-col px-3 pb-3">
            {agentFeed.map((f, i) => {
              const a = agents.find((x) => x.id === f.agent)!;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.4 }}
                  onClick={() => router.push(`/workspace?task=${a.defaultWorkflow}`)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-canvas cursor-pointer"
                >
                  <AgentAvatar agent={f.agent} color={a.color} size={32} state={i === 0 ? "complete" : "idle"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink">{f.text}</div>
                    <div className="text-xs text-ink-3">{a.name}</div>
                  </div>
                  <span className="text-[11px] text-ink-4 whitespace-nowrap">{f.time}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Recent shipments */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Recent shipments"
          subtitle="Click any shipment to open its detail and AI analysis"
          action={
            <Button size="sm" variant="ghost" onClick={() => router.push("/shipments")}>
              View all 24 <ArrowRight className="size-3.5" />
            </Button>
          }
        />
        <ShipmentTable rows={recent} />
      </Card>
    </div>
  );
}
