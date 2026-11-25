"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, ChevronDown, Info, RotateCcw, Sparkles, TrendingDown } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AgentExecution } from "@/components/agent-execution";
import { costColors } from "@/components/cost-charts";
import { useToast } from "@/components/toast";
import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { costInputsFor, defaultFx, getShipment, handlingBenchmarkEgp, landedCost, partnerName, shipments, type CostInputs } from "@/data";
import type { Shipment } from "@/data/types";
import { cn, egp, egpCompact, usd } from "@/lib/format";
import type { SimStep } from "@/lib/simulation";

const CostDonut = dynamic(() => import("@/components/cost-charts").then((m) => m.CostDonut), { ssr: false });
const FxSensitivity = dynamic(() => import("@/components/cost-charts").then((m) => m.FxSensitivity), { ssr: false });

const optSteps: SimStep[] = [
  { label: "Analyzing shipment cost structure", logs: ["Decomposed landed cost into 7 components", "Overhead vs purchase value calculated"], ms: 1100 },
  { label: "Reviewing historical sample quotations", logs: ["Loaded 14 sample quotations on this lane (last 6 months)"], ms: 1100 },
  { label: "Comparing freight scenarios", logs: ["Booked carrier vs 3 alternatives", "Lowest comparable quote found"], ms: 1200 },
  { label: "Evaluating FX exposure", logs: ["Payable due in 45 days · USD-denominated", "Sensitivity computed for USD/EGP 46–54"], ms: 1100 },
  { label: "Identifying potential savings", logs: ["Port & handling compared with internal benchmark"], ms: 1000 },
  { label: "Preparing recommendations", logs: ["Ranking actions by estimated savings"], ms: 800 },
];

function benchmarkFor(s: Shipment) {
  return s.id === "IMP-2026-051" ? handlingBenchmarkEgp : Math.round((s.portFeesEgp * 0.92) / 1000) * 1000;
}

function Slider({ label, value, min, max, step, onChange, format, hint }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; hint?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-[13.5px] font-semibold tabular text-ink">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, var(--color-brand) ${pct}%, transparent ${pct}%)`, borderRadius: 4 }}
      />
      {hint && <div className="mt-1 text-[11px] text-ink-4">{hint}</div>}
    </div>
  );
}

export function CostView({ shipmentId }: { shipmentId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const imports = shipments.filter((s) => s.direction === "import");
  const s = getShipment(shipmentId ?? "IMP-2026-051") ?? getShipment("IMP-2026-051")!;
  const base = useMemo(() => costInputsFor(s), [s]);
  const [inp, setInp] = useState<CostInputs>(base);
  const [picker, setPicker] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setInp(base);
    setRunKey(0);
  }, [base]);

  const lc = landedCost(inp);
  const baseLc = landedCost(base);
  const delta = lc.total - baseLc.total;
  const changed = JSON.stringify(inp) !== JSON.stringify(base);

  // Margin model: goods resold locally in EGP at baseline landed cost + 22%
  const saleEgp = baseLc.totalEgp * 1.22;
  const margin = (1 - lc.totalEgp / saleEgp) * 100;
  const fxData = [46, 47, 48, 49, 50, 51, 52, 53, 54].map((fx) => ({ fx, margin: (1 - landedCost({ ...inp, fx }).totalEgp / saleEgp) * 100 }));

  const set = <K extends keyof CostInputs>(k: K, v: CostInputs[K]) => setInp((p) => ({ ...p, [k]: v }));

  // Optimization findings
  const altFreight = s.id === "IMP-2026-051" ? 11350 : Math.round((s.freight * 0.82) / 50) * 50;
  const freightSave = s.freight - altFreight;
  const bench = benchmarkFor(s);
  const handlingSave = Math.max(0, (s.portFeesEgp - bench) / defaultFx);
  const insuranceSave = baseLc.cif * 0.0015;
  const fxExposureEgp = baseLc.total; // EGP impact of a 1.00 move
  const actions = [
    { title: "Switch to alternative freight quotation", detail: `Sample quote ${usd(altFreight)} vs booked ${usd(s.freight)} on ${s.origin} → ${s.destination}`, save: freightSave },
    { title: "Negotiate port & handling with clearing agent", detail: `Estimated ${egpCompact(s.portFeesEgp)} vs internal benchmark ${egpCompact(bench)}`, save: handlingSave },
    { title: "Move cargo insurance to annual open policy", detail: "Sample annual policy rate 0.35% vs 0.50% per shipment", save: insuranceSave },
  ].sort((a, b) => b.save - a.save);
  const totalSave = actions.reduce((a, b) => a + b.save, 0);

  const switchShipment = (id: string) => {
    setPicker(false);
    router.replace(`/costs?shipment=${id}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cost Intelligence"
        subtitle="Landed cost breakdown, scenario simulation and AI cost optimization."
        actions={
          <>
            <div className="relative">
              <Button onClick={() => setPicker((p) => !p)}>
                <span className="text-ink-3">Shipment</span> <span className="tabular">{s.id}</span> <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
              <AnimatePresence>
                {picker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPicker(false)} />
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="scrollbar-thin absolute right-0 top-11 z-50 max-h-[360px] w-[320px] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-pop">
                      {imports.map((x) => (
                        <button key={x.id} onClick={() => switchShipment(x.id)} className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-canvas cursor-pointer", x.id === s.id && "bg-canvas")}>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium tabular">{x.id}</span>
                            <span className="block truncate text-xs text-ink-3">{x.product}</span>
                          </span>
                          <span className="text-xs text-ink-2 tabular">{usd(x.value)}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <Button variant="primary" icon={Sparkles} onClick={() => { setRunKey((k) => k + 1); setTimeout(() => document.getElementById("optimization")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }}>
              Run AI Cost Optimization
            </Button>
          </>
        }
      />

      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Headline label="Total estimated landed cost" value={usd(lc.total)} sub={egp(lc.totalEgp)} delta={delta} />
        <Headline label="Product purchase value" value={usd(inp.value)} sub={`${s.id} · ${partnerName(s.partnerId).split(" ").slice(0, 2).join(" ")}`} />
        <Headline label="Cost on top of purchase value" value={`+${lc.overheadPct.toFixed(1)}%`} sub={usd(lc.overhead)} />
        <Headline label="Estimated gross margin" value={`${margin.toFixed(1)}%`} sub="If resold at planned EGP price" warn={margin < 12} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Breakdown */}
        <Card>
          <CardHeader title="Landed cost breakdown" subtitle={`${s.product} · ${s.incoterm} · ${s.container}`} />
          <div className="grid gap-6 px-5 pb-5 md:grid-cols-[200px_1fr] md:items-center">
            <div className="relative mx-auto h-[200px] w-[200px]">
              <CostDonut data={lc.lines} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[11px] text-ink-3">Landed cost</div>
                <div className="text-[18px] font-semibold tabular">{usd(lc.total / 1000, 0)}K</div>
              </div>
            </div>
            <div className="flex flex-col">
              {lc.lines.map((l, i) => {
                const share = (l.usd / lc.total) * 100;
                const bLine = baseLc.lines[i].usd;
                const d = l.usd - bLine;
                return (
                  <div key={l.key} className="grid grid-cols-[12px_1fr_auto] items-center gap-3 border-b border-line/70 py-2.5 last:border-0">
                    <span className="size-2.5 rounded-sm" style={{ background: costColors[i] }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[13px] text-ink">
                        {l.label}
                        {l.key === "port" && s.portFeesEgp > benchmarkFor(s) * 1.2 && <AlertTriangle className="size-3.5 text-amber" />}
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-canvas">
                        <motion.div className="h-full rounded-full" style={{ background: costColors[i] }} animate={{ width: `${Math.max(share, 0.5)}%` }} transition={{ duration: 0.5 }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13.5px] font-medium tabular">{usd(l.usd)}</div>
                      <div className={cn("text-[11px] tabular", Math.abs(d) > 1 ? (d > 0 ? "text-rose" : "text-mint") : "text-ink-4")}>
                        {Math.abs(d) > 1 ? `${d > 0 ? "+" : "−"}${usd(Math.abs(d))}` : `${share.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-canvas px-3 py-2.5">
                <span className="text-[13px] font-semibold">Total estimated landed cost</span>
                <span className="text-[15px] font-semibold tabular">{usd(lc.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Simulator */}
        <Card>
          <CardHeader
            title="Cost simulator"
            subtitle="Adjust assumptions — totals update instantly"
            action={
              <Button size="sm" variant="ghost" icon={RotateCcw} disabled={!changed} onClick={() => { setInp(base); toast({ title: "Assumptions reset", tone: "info" }); }}>
                Reset
              </Button>
            }
          />
          <div className="flex flex-col gap-6 px-5 pb-5">
            <Slider label="USD / EGP exchange rate" value={inp.fx} min={42} max={58} step={0.1} onChange={(v) => set("fx", v)} format={(v) => v.toFixed(2)} hint="Demo assumption, not a live rate" />
            <Slider label="Ocean freight" value={inp.freight} min={Math.round(s.freight * 0.5)} max={Math.round(s.freight * 1.6)} step={50} onChange={(v) => set("freight", v)} format={(v) => usd(v)} />
            <Slider label="Estimated customs duty rate" value={inp.dutyRate} min={0} max={40} step={0.5} onChange={(v) => set("dutyRate", v)} format={(v) => `${v.toFixed(1)}%`} hint="Hypothetical rate — not an authoritative Egyptian tariff" />
            <Slider label="Port & handling fees" value={inp.portFeesEgp} min={Math.round(s.portFeesEgp * 0.5 / 1000) * 1000} max={Math.round(s.portFeesEgp * 1.6 / 1000) * 1000} step={1000} onChange={(v) => set("portFeesEgp", v)} format={(v) => egp(v)} />
            <div className="rounded-xl border border-line bg-canvas/60 p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-3">Change vs baseline</span>
                <span className={cn("text-[15px] font-semibold tabular", delta > 1 ? "text-rose" : delta < -1 ? "text-mint" : "text-ink")}>
                  {Math.abs(delta) < 1 ? "No change" : `${delta > 0 ? "+" : "−"}${usd(Math.abs(delta))}`}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-ink-3">
                <span>In EGP</span>
                <span className="tabular">{egp(lc.totalEgp - baseLc.totalEgp)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="FX sensitivity" subtitle="Estimated gross margin across USD/EGP scenarios" />
          <div className="h-[220px] px-3 pb-4">
            <FxSensitivity data={fxData} current={inp.fx} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
            <div className="text-[13px] leading-relaxed text-ink-3">
              <div className="mb-1 font-medium text-ink">About these figures</div>
              All duty, tax, FX and fee values are hypothetical, user-editable assumptions for demonstration. They are not authoritative Egyptian customs rates. Insurance is modelled at 0.5% of value + freight and VAT at 14% of CIF + duty. Confirm actual charges with your customs broker.
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-lg bg-canvas p-3">
              <div className="text-ink-3">CIF value</div>
              <div className="font-semibold tabular">{usd(lc.cif)}</div>
            </div>
            <div className="rounded-lg bg-canvas p-3">
              <div className="text-ink-3">Handling benchmark</div>
              <div className="font-semibold tabular">{egpCompact(benchmarkFor(s))}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Optimization */}
      <div id="optimization" className="scroll-mt-24">
        {runKey === 0 ? (
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_180px_at_0%_50%,rgba(18,165,148,0.08),transparent)]" />
            <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="grid size-11 place-items-center rounded-xl bg-mint-50">
                <TrendingDown className="size-5 text-mint" />
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-semibold">Financial Intelligence Agent</div>
                <div className="text-[13px] text-ink-3">Reviews freight scenarios, FX exposure and handling charges to find savings for {s.id}.</div>
              </div>
              <Button variant="primary" icon={Sparkles} onClick={() => setRunKey(1)}>Run AI Cost Optimization</Button>
            </div>
          </Card>
        ) : (
          <AgentExecution
            key={`${s.id}-${runKey}`}
            agentName="Financial Intelligence Agent"
            agent="financial"
            color="#12a594"
            task={`Optimizing landed cost for ${s.id}`}
            steps={optSteps}
            result={
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Finding tone="good" title="Alternative freight quotation" value={`−${usd(freightSave)}`} body={`Comparable service at ${usd(altFreight)} vs ${usd(s.freight)} booked.`} />
                  <Finding tone="warn" title="FX sensitivity" value={`${egpCompact(fxExposureEgp)}`} body="Change in landed cost for every 1.00 EGP move in USD/EGP." />
                  <Finding tone="warn" title="Handling above benchmark" value={`+${(((s.portFeesEgp - bench) / bench) * 100).toFixed(0)}%`} body={`${egpCompact(s.portFeesEgp)} vs ${egpCompact(bench)} internal benchmark.`} />
                  <Finding tone="good" title="Total potential savings" value={usd(totalSave)} body={`${((totalSave / baseLc.total) * 100).toFixed(1)}% of estimated landed cost.`} />
                </div>
                <Card className="overflow-hidden">
                  <div className="border-b border-line px-5 py-4">
                    <div className="text-[15px] font-semibold">Recommended actions</div>
                    <div className="text-[13px] text-ink-3">Ranked by estimated savings</div>
                  </div>
                  <div className="divide-y divide-line">
                    {actions.map((a, i) => (
                      <motion.div key={a.title} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 * i + 0.2 }} className="flex flex-wrap items-center gap-4 px-5 py-4">
                        <span className="grid size-7 place-items-center rounded-full bg-canvas text-[12px] font-semibold tabular text-ink-2">{i + 1}</span>
                        <div className="min-w-[220px] flex-1">
                          <div className="text-[14px] font-medium">{a.title}</div>
                          <div className="text-[13px] text-ink-3">{a.detail}</div>
                        </div>
                        <div className="w-[160px]">
                          <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
                            <motion.div className="h-full rounded-full bg-mint" initial={{ width: 0 }} animate={{ width: `${(a.save / actions[0].save) * 100}%` }} transition={{ delay: 0.3 + 0.1 * i, duration: 0.7 }} />
                          </div>
                        </div>
                        <div className="w-[90px] text-right text-[15px] font-semibold tabular text-mint">−{usd(a.save)}</div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (a.title.startsWith("Switch")) set("freight", altFreight);
                            if (a.title.startsWith("Negotiate")) set("portFeesEgp", bench);
                            if (a.title.startsWith("Move")) set("insuranceRate", 0.35);
                            toast({ title: "Scenario applied to simulator", body: a.title });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Apply
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
                <p className="text-xs text-ink-4">
                  Quotations are sample data. Savings are estimates based on demo assumptions. <Link href={`/shipments/${s.id}`} className="text-brand hover:underline">Open shipment <ArrowRight className="inline size-3" /></Link>
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

function Headline({ label, value, sub, delta, warn }: { label: string; value: string; sub: string; delta?: number; warn?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-[13px] font-medium text-ink-3">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <motion.span key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className={cn("text-[24px] font-semibold tracking-tight tabular", warn && "text-amber")}>
          {value}
        </motion.span>
        {delta !== undefined && Math.abs(delta) > 1 && (
          <span className={cn("text-xs font-medium tabular", delta > 0 ? "text-rose" : "text-mint")}>
            {delta > 0 ? "+" : "−"}
            {usd(Math.abs(delta))}
          </span>
        )}
      </div>
      <div className="mt-1 truncate text-xs text-ink-3 tabular">{sub}</div>
    </div>
  );
}

function Finding({ tone, title, value, body }: { tone: "good" | "warn"; title: string; value: string; body: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <span className={cn("size-1.5 rounded-full", tone === "good" ? "bg-mint" : "bg-amber")} />
        {title}
      </div>
      <div className={cn("mt-2 text-[22px] font-semibold tracking-tight tabular", tone === "good" ? "text-mint" : "text-ink")}>{value}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{body}</p>
    </motion.div>
  );
}
