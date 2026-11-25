"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FileText,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AgentExecution } from "@/components/agent-execution";
import { Button, Card, CardHeader, DocStatusPill, RiskIndicator, StageProgress, StatusPill } from "@/components/ui";
import { costInputsFor, documentsFor, getShipment, landedCost, partnerName, timelineFor } from "@/data";
import { cn, date, dateLong, num, usd } from "@/lib/format";
import { shipmentAnalysis, type Finding } from "@/lib/shipment-analysis";

const sevStyle: Record<Finding["severity"], [string, string, typeof AlertCircle]> = {
  high: ["text-rose", "bg-rose-50", AlertCircle],
  medium: ["text-amber", "bg-amber-50", AlertCircle],
  low: ["text-ink-2", "bg-canvas", Info],
  ok: ["text-mint", "bg-mint-50", CheckCircle2],
};

function Findings({ findings, summary }: { findings: Finding[]; summary: string }) {
  const router = useRouter();
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-brand-50/60 to-transparent px-5 py-4">
        <Sparkles className="size-4 text-brand" />
        <div className="text-[15px] font-semibold">AI shipment analysis · {summary}</div>
      </div>
      <div className="divide-y divide-line">
        {findings.map((f, i) => {
          const [c, bg, Icon] = sevStyle[f.severity];
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i + 0.2 }} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", bg)}>
                <Icon className={cn("size-4", c)} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-ink">{f.title}</div>
                <div className="text-[13px] text-ink-3">{f.detail}</div>
              </div>
              {f.action && (
                <Button size="sm" onClick={() => router.push(f.action!.href)}>
                  {f.action.label} <ArrowRight className="size-3.5" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const s = getShipment(id);
  const [run, setRun] = useState(0);
  const analysis = useMemo(() => (s ? shipmentAnalysis(s) : null), [s]);

  if (!s || !analysis) {
    return (
      <div className="py-24 text-center">
        <p className="text-ink-3">Shipment {id} was not found.</p>
        <Link href="/shipments" className="mt-3 inline-block text-brand">Back to shipments</Link>
      </div>
    );
  }

  const docs = documentsFor(s);
  const timeline = timelineFor(s);
  const lc = landedCost(costInputsFor(s));
  const isExport = s.direction === "export";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/shipments" className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
          <ArrowLeft className="size-3.5" /> All shipments
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] tabular">{s.id}</h1>
              <StatusPill status={s.status} />
              <RiskIndicator risk={s.risk} />
            </div>
            <p className="mt-1 text-[15px] text-ink-3">
              {s.product} · {isExport ? "Export to" : "Import from"} {partnerName(s.partnerId)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isExport && (
              <Link href={`/documents?shipment=${s.id}`}>
                <Button icon={FileText}>Documents</Button>
              </Link>
            )}
            <Button variant="primary" icon={Sparkles} onClick={() => setRun((r) => r + 1)}>
              {run ? "Re-run AI Shipment Analysis" : "Run AI Shipment Analysis"}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {run > 0 && (
          <motion.div key={run} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="overflow-hidden">
            <AgentExecution
              agentName="TradeFlow Orchestrator"
              agent="orchestrator"
              task={`Analyzing ${s.id} across documents, logistics and cost`}
              steps={analysis.steps}
              result={<Findings findings={analysis.findings} summary={analysis.summary} />}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview */}
      <Card className="p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
            {[
              ["Origin", `${s.origin}, ${s.originCountry}`],
              ["Destination", `${s.destination}, ${s.destinationCountry}`],
              ["Shipment value", usd(s.value)],
              ["Quantity", `${num(s.quantity)} ${s.unit}`],
              ["Category", s.category],
              ["Incoterm", s.incoterm],
              ["Mode", `${s.mode} · ${s.container}`],
              ["Carrier", s.carrier],
              ["Departure", dateLong(s.departure)],
              ["Estimated arrival", dateLong(s.eta)],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-ink-3">{k}</div>
                <div className="mt-0.5 font-medium text-ink tabular">{v}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-xl border border-line bg-canvas/50 p-5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink">Shipment progress</span>
              <span className="text-ink-3">{s.origin} → {s.destination}</span>
            </div>
            <RouteViz stage={s.stage} origin={s.origin} destination={s.destination} warn={s.risk === "high"} />
            <StageProgress stage={s.stage} warn={s.risk === "high"} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" subtitle="Milestones and upcoming deadlines" />
            <ol className="px-5 pb-5">
              {timeline.map((e, i) => {
                const deadline = e.title.includes("free time");
                return (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < timeline.length - 1 && <span className={cn("absolute left-[7px] top-5 bottom-0 w-px", e.done ? "bg-brand/40" : "bg-line")} />}
                    <span
                      className={cn(
                        "relative mt-1 size-[15px] shrink-0 rounded-full border-2",
                        e.done ? "border-brand bg-brand" : deadline ? "border-rose bg-white" : "border-line-strong bg-white"
                      )}
                    />
                    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                      <div>
                        <div className={cn("text-[13.5px] font-medium", deadline ? "text-rose" : e.done ? "text-ink" : "text-ink-2")}>{e.title}</div>
                        <div className="text-xs text-ink-3">{e.detail}</div>
                      </div>
                      <div className="text-xs text-ink-3 tabular">{date(e.date)}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader
              title="Document checklist"
              subtitle={`${docs.filter((d) => d.status === "verified").length} of ${docs.length} verified`}
              action={
                !isExport && (
                  <Link href={`/documents?shipment=${s.id}`} className="text-[13px] font-medium text-brand hover:underline">
                    Analyze with AI
                  </Link>
                )
              }
            />
            <div className="divide-y divide-line border-t border-line">
              {docs.map((d) => (
                <div key={d.name} className="flex items-center gap-3 px-5 py-3">
                  {d.status === "verified" ? (
                    <CheckCircle2 className="size-4 text-mint" />
                  ) : d.status === "missing" ? (
                    <AlertCircle className="size-4 text-amber" />
                  ) : (
                    <CircleDashed className="size-4 text-ink-4" />
                  )}
                  <span className="flex-1 text-[13.5px] text-ink">{d.type}</span>
                  <DocStatusPill status={d.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* AI insights panel */}
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-50/70 to-transparent" />
            <div className="relative">
              <CardHeader title="AI Insights" subtitle="Continuously monitored by 6 agents" icon={Sparkles} />
              <div className="flex flex-col gap-2 px-5 pb-5">
                {analysis.findings.map((f, i) => {
                  const [c, bg, Icon] = sevStyle[f.severity];
                  return (
                    <div key={i} className="flex gap-3 rounded-xl border border-line bg-white p-3">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", bg)}>
                        <Icon className={cn("size-3.5", c)} />
                      </span>
                      <div>
                        <div className="text-[13px] font-medium text-ink">{f.title}</div>
                        <div className="text-xs text-ink-3">{f.detail}</div>
                      </div>
                    </div>
                  );
                })}
                {s.riskNote && <p className="mt-1 text-xs text-ink-3">Run a full analysis for a step-by-step agent review.</p>}
              </div>
            </div>
          </Card>

          {/* Cost summary */}
          <Card>
            <CardHeader
              title={isExport ? "Commercial summary" : "Estimated landed cost"}
              subtitle={isExport ? "Export value and terms" : "Based on editable demo assumptions"}
              action={
                !isExport && (
                  <Link href={`/costs?shipment=${s.id}`} className="text-[13px] font-medium text-brand hover:underline">
                    Simulate
                  </Link>
                )
              }
            />
            <div className="px-5 pb-5">
              {isExport ? (
                <div className="flex flex-col gap-2 text-[13px]">
                  <Row k="Invoice value" v={usd(s.value)} />
                  <Row k="Incoterm" v={s.incoterm} />
                  <Row k="Payment terms" v="Confirmed L/C · 60 days" />
                  <Row k="Est. freight (seller paid)" v={s.incoterm.startsWith("FOB") ? "—" : usd(s.freight)} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 text-[13px]">
                    {lc.lines.map((l) => (
                      <Row key={l.key} k={l.label} v={usd(l.usd)} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[13px] font-medium">Total landed cost</span>
                    <span className="text-[17px] font-semibold tabular">{usd(lc.total)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-3">{k}</span>
      <span className="font-medium text-ink tabular">{v}</span>
    </div>
  );
}

function RouteViz({ stage, origin, destination, warn }: { stage: number; origin: string; destination: string; warn: boolean }) {
  const pos = Math.min(stage, 3) / 3; // ship position along sea leg
  return (
    <div className="relative h-16">
      <svg viewBox="0 0 400 60" className="h-full w-full" preserveAspectRatio="none">
        <path d="M10 40 C 120 0, 280 0, 390 40" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" strokeDasharray="3 5" />
        <motion.path
          d="M10 40 C 120 0, 280 0, 390 40"
          fill="none"
          stroke={warn ? "#d4463b" : "#4f5bd5"}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pos }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <circle cx="10" cy="40" r="4" fill="#4f5bd5" />
        <circle cx="390" cy="40" r="4" fill={stage >= 3 ? "#4f5bd5" : "white"} stroke="#4f5bd5" strokeWidth="1.5" />
      </svg>
      <div className="absolute bottom-0 left-0 text-[11px] font-medium text-ink-2">{origin}</div>
      <div className="absolute bottom-0 right-0 text-[11px] font-medium text-ink-2">{destination}</div>
    </div>
  );
}
