"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  CircleHelp,
  Clock,
  FileWarning,
  Mail,
  Plus,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { complianceChecklist, delayRisks, demoBuyers, exportMarkets, quotations, type ResultKind } from "@/data/agents";
import { costInputsFor, landedCost, shipments } from "@/data";
import { cn, usd } from "@/lib/format";
import { EmailPanel, type DraftEmail } from "./email-panel";
import { useToast } from "./toast";
import { Button, Card, RiskIndicator } from "./ui";

function Recommendation({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex flex-col gap-4 rounded-[14px] border border-brand/20 bg-gradient-to-r from-brand-50 via-white to-white p-5 shadow-card sm:flex-row sm:items-center"
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
        <Sparkles className="size-5" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-medium uppercase tracking-wider text-brand">Final recommendation</div>
        <div className="mt-0.5 text-[15px] font-medium leading-snug text-ink">{children}</div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="text-[15px] font-semibold">{title}</div>
        {subtitle && <div className="text-[13px] text-ink-3">{subtitle}</div>}
      </div>
      {children}
    </Card>
  );
}

/* ---------- Shipment review (multi-agent) ---------- */
function ShipmentReview() {
  const router = useRouter();
  const blocks = [
    { agent: "Document Intelligence", color: "#4f5bd5", icon: FileWarning, title: "Quantity mismatch & missing ACID reference", body: "Invoice 850 units vs packing list 800 units. ACID reference absent on packing list." },
    { agent: "Logistics", color: "#2f80c8", icon: Clock, title: "Corrections needed before 30 Nov", body: "Vessel on schedule, ETA 2 Dec at Ain Sokhna. Late documents risk a customs hold." },
    { agent: "Financial Intelligence", color: "#12a594", icon: TrendingDown, title: "≈ $11,000 value at stake", body: "Estimated landed cost ≈ $237K. A hold could add ≈ $900/day in storage and demurrage." },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {blocks.map((b, i) => (
          <motion.div key={b.agent} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }} className="card p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: b.color }}>
              <b.icon className="size-3.5" /> {b.agent}
            </div>
            <div className="mt-2 text-[14.5px] font-semibold text-ink">{b.title}</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{b.body}</p>
          </motion.div>
        ))}
      </div>
      <Recommendation
        actions={
          <>
            <Button onClick={() => router.push("/shipments/IMP-2026-048")}>Open shipment</Button>
            <Button variant="primary" onClick={() => router.push("/documents?shipment=IMP-2026-048")}>
              Fix documents <ArrowRight className="size-3.5" />
            </Button>
          </>
        }
      >
        Request a corrected packing list with the ACID reference from Shenzhen Brightway by 28 Nov, and confirm the HS classification with your broker.
      </Recommendation>
    </div>
  );
}

/* ---------- Document sweep ---------- */
function DocumentsResult() {
  const router = useRouter();
  const rows = [
    { id: "IMP-2026-048", issue: "Quantity mismatch (850 vs 800) · ACID reference missing", sev: "high" as const },
    { id: "IMP-2026-039", issue: "Certificate of origin awaiting legalization", sev: "medium" as const },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Section title="2 shipments with document issues" subtitle="22 shipments passed all document checks">
        <div className="divide-y divide-line">
          {rows.map((r) => (
            <button key={r.id} onClick={() => router.push(`/documents?shipment=${r.id}`)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-canvas/60 cursor-pointer">
              <RiskIndicator risk={r.sev} label={false} />
              <span className="w-[120px] text-[13.5px] font-medium tabular">{r.id}</span>
              <span className="flex-1 text-[13px] text-ink-2">{r.issue}</span>
              <ArrowRight className="size-4 text-ink-4" />
            </button>
          ))}
        </div>
      </Section>
      <Recommendation actions={<Button variant="primary" onClick={() => router.push("/documents?shipment=IMP-2026-048")}>Review IMP-2026-048</Button>}>
        Prioritize IMP-2026-048: it arrives in 9 days and has a confirmed quantity mismatch.
      </Recommendation>
    </div>
  );
}

/* ---------- Most expensive imports ---------- */
function ExpensiveResult() {
  const router = useRouter();
  const rows = shipments
    .filter((s) => s.direction === "import")
    .map((s) => ({ s, lc: landedCost(costInputsFor(s)) }))
    .sort((a, b) => b.lc.total - a.lc.total)
    .slice(0, 5);
  const max = rows[0].lc.total;
  return (
    <div className="flex flex-col gap-4">
      <Section title="Top 5 imports by estimated landed cost" subtitle="Using workspace assumptions · duty 5% · VAT 14% · FX 48.60">
        <div className="flex flex-col gap-3 p-5">
          {rows.map(({ s, lc }, i) => (
            <button key={s.id} onClick={() => router.push(`/costs?shipment=${s.id}`)} className="group grid grid-cols-[110px_1fr_100px] items-center gap-4 text-left cursor-pointer sm:grid-cols-[130px_1fr_110px_80px]">
              <div>
                <div className="text-[13px] font-medium tabular group-hover:text-brand">{s.id}</div>
                <div className="truncate text-[11px] text-ink-3">{s.product}</div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#12a594] to-[#3cc4b2]" initial={{ width: 0 }} animate={{ width: `${(lc.total / max) * 100}%` }} transition={{ delay: 0.1 * i, duration: 0.8 }} />
              </div>
              <div className="text-right text-[13.5px] font-semibold tabular">{usd(lc.total)}</div>
              <div className={cn("hidden text-right text-xs tabular sm:block", lc.overheadPct > 20 ? "text-amber" : "text-ink-3")}>+{lc.overheadPct.toFixed(1)}%</div>
            </button>
          ))}
        </div>
      </Section>
      <Recommendation actions={<Button variant="primary" onClick={() => router.push("/costs?shipment=IMP-2026-051")}>Optimize IMP-2026-051</Button>}>
        IMP-2026-051 carries the highest landed cost and above-benchmark freight and handling. Switching carriers could save ≈ $2,850.
      </Recommendation>
    </div>
  );
}

/* ---------- Delays ---------- */
function DelaysResult() {
  const toast = useToast();
  const router = useRouter();
  const [added, setAdded] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {delayRisks.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }} className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <button onClick={() => router.push(`/shipments/${r.id}`)} className="text-[13px] font-medium text-brand tabular hover:underline cursor-pointer">{r.id}</button>
              <RiskIndicator risk={r.severity} />
            </div>
            <div className="mt-2 text-[14.5px] font-semibold">{r.title}</div>
            <div className="text-[13px] text-ink-3">{r.detail}</div>
            <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-2">
              <span className="text-ink-3">Exposure: </span>
              {r.exposure}
            </div>
            <div className="mt-3 text-[13px] text-ink-2">
              <span className="font-medium text-ink">Next action: </span>
              {r.action}
            </div>
            <Button
              size="sm"
              className="mt-4 self-start"
              icon={added.includes(r.id) ? CheckCircle2 : Plus}
              disabled={added.includes(r.id)}
              onClick={() => {
                setAdded((a) => [...a, r.id]);
                toast({ title: "Task created", body: `${r.id} · assigned to operations team` });
              }}
            >
              {added.includes(r.id) ? "Task created" : "Create task"}
            </Button>
          </motion.div>
        ))}
      </div>
      <Recommendation>
        File the IMP-2026-032 customs declaration today. Each day after 26 Nov adds ≈ $1,150 in demurrage. The other 21 shipments are on schedule.
      </Recommendation>
    </div>
  );
}

/* ---------- Suppliers ---------- */
function SuppliersResult() {
  const best = quotations.reduce((a, b) => (b.score > a.score ? b : a));
  return (
    <div className="flex flex-col gap-4">
      <Section title="Supplier comparison · 200 servo drive kits" subtitle="Delivered cost normalized to Egypt port, incl. freight and insurance">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-line bg-canvas/50 text-left text-[11.5px] uppercase tracking-wider text-ink-3">
                <th className="px-5 py-2.5 font-medium">Supplier</th>
                <th className="px-3 py-2.5 font-medium">Incoterm</th>
                <th className="px-3 py-2.5 text-right font-medium">Unit price</th>
                <th className="px-3 py-2.5 text-right font-medium">Delivered / unit</th>
                <th className="px-3 py-2.5 text-right font-medium">Lead time</th>
                <th className="px-3 py-2.5 text-right font-medium">On-time</th>
                <th className="px-5 py-2.5 text-right font-medium">AI score</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => {
                const isBest = q === best;
                return (
                  <tr key={q.supplier} className={cn("border-b border-line/70 last:border-0", isBest && "bg-mint-50/50")}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-medium text-ink">
                        {q.supplier}
                        {isBest && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            <Award className="size-3" /> Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-3">{q.country} · {q.warranty} warranty</div>
                    </td>
                    <td className="px-3 text-ink-2">{q.incoterm}</td>
                    <td className="px-3 text-right tabular">{usd(q.unit)}</td>
                    <td className="px-3 text-right font-medium tabular">{usd(q.delivered)}</td>
                    <td className="px-3 text-right tabular">{q.lead} days</td>
                    <td className="px-3 text-right tabular">{q.onTime}%</td>
                    <td className="px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-canvas">
                          <motion.div className={cn("h-full rounded-full", isBest ? "bg-mint" : "bg-ink-4")} initial={{ width: 0 }} animate={{ width: `${q.score}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <span className="w-6 font-semibold tabular">{q.score}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
      <Recommendation>
        Choose Anadolu Endüstri: delivered cost is only 3% above the lowest quote, with a 14-day lead time (vs 42), 93% on-time delivery and 24-month warranty.
      </Recommendation>
    </div>
  );
}

/* ---------- Compliance ---------- */
function ComplianceResult() {
  const icon = { ok: <CheckCircle2 className="size-4 text-mint" />, flag: <AlertCircle className="size-4 text-rose" />, review: <CircleHelp className="size-4 text-amber" /> };
  const label = { ok: "Passed", flag: "Issue", review: "Verify" };
  return (
    <div className="flex flex-col gap-4">
      <Section title="Compliance checklist · IMP-2026-048" subtitle="Industrial PLC control modules · declared HS 8537.10">
        <div className="divide-y divide-line">
          {complianceChecklist.map((c, i) => (
            <motion.div key={c.item} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }} className="flex items-center gap-3 px-5 py-3">
              {icon[c.state]}
              <span className="flex-1 text-[13.5px] text-ink">{c.item}</span>
              {c.note && <span className="hidden text-xs text-ink-3 sm:block">{c.note}</span>}
              <span className={cn("w-14 text-right text-xs font-medium", c.state === "ok" ? "text-mint" : c.state === "flag" ? "text-rose" : "text-amber")}>{label[c.state]}</span>
            </motion.div>
          ))}
        </div>
      </Section>
      <Recommendation>
        Two document issues need supplier correction. HS classification and conformity requirements are flagged for review by a licensed customs broker — the agent does not make regulatory determinations.
      </Recommendation>
    </div>
  );
}

/* ---------- Export growth ---------- */
const outreach: DraftEmail = {
  to: "Purchasing team <einkauf@nordlicht-objekt.example>",
  subject: "Egyptian-made contract furniture for your 2027 projects",
  body: `Dear Purchasing Team,

I'm reaching out from Nile Industrial Trading in Cairo. We manufacture and export steel-frame office furniture and upholstered contract seating, and currently supply distributors in the Netherlands and the Gulf.

Given Nordlicht's focus on office and contract projects, I believe our range could be a good fit:

• Steel-frame desks and storage systems, EN 527-tested designs
• Upholstered seating with custom fabric options
• 18–21 day sea transit Alexandria → Hamburg, CIF or FOB terms
• Competitive pricing with consistent quality from a single production partner

I'd be glad to send our 2027 catalogue and a sample price list, or arrange a short call at your convenience.

Kind regards,
Ahmed Mansour
Operations Director
Nile Industrial Trading · Cairo, Egypt`,
};

function ExportResult() {
  const [open, setOpen] = useState(false);
  const dims: [keyof (typeof exportMarkets)[number], string][] = [
    ["demand", "Demand"],
    ["price", "Price point"],
    ["logistics", "Logistics"],
    ["competition", "Competitive room"],
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {exportMarkets.map((m, i) => (
          <motion.div key={m.market} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }} className="card p-5">
            <div className="flex items-baseline justify-between">
              <div className="text-[15px] font-semibold">{m.market}</div>
              <div className="text-[22px] font-semibold tabular text-ink">
                {m.overall}
                <span className="text-xs font-normal text-ink-4">/100</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-ink-3">{m.note}</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {dims.map(([k, l]) => (
                <div key={k} className="grid grid-cols-[100px_1fr_28px] items-center gap-2 text-xs">
                  <span className="text-ink-3">{l}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
                    <motion.div className="h-full rounded-full bg-[#d4463b]/80" initial={{ width: 0 }} animate={{ width: `${m[k]}%` }} transition={{ delay: 0.2 + 0.1 * i, duration: 0.8 }} />
                  </div>
                  <span className="text-right tabular text-ink-2">{m[k] as number}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="-mt-1 text-xs text-ink-4">Market scores are fictional illustrative values for demonstration purposes.</p>

      <Section title="Potential buyers in Germany" subtitle="Demo example profiles — fictional companies">
        <div className="divide-y divide-line">
          {demoBuyers.map((b) => (
            <div key={b.name} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <div className="grid size-9 place-items-center rounded-lg bg-canvas text-xs font-semibold text-ink-2">{b.name.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-2 text-[13.5px] font-medium">
                  {b.name}
                  <span className="rounded bg-ink/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-ink-3">DEMO</span>
                </div>
                <div className="text-xs text-ink-3">{b.city} · {b.segment} · {b.size}</div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-semibold tabular text-mint">{b.fit}%</div>
                <div className="text-[11px] text-ink-3">fit score</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Recommendation actions={<Button variant="primary" icon={Mail} onClick={() => setOpen(true)}>Generate outreach email</Button>}>
        Saudi Arabia scores highest overall, but Germany offers the best price point for contract furniture. Start outreach with Nordlicht Objektmöbel (91% fit).
      </Recommendation>
      <EmailPanel open={open} onClose={() => setOpen(false)} email={outreach} agent="export" agentName="Export Growth" color="#d4463b" />
    </div>
  );
}

export function WorkflowResult({ kind }: { kind: ResultKind }) {
  switch (kind) {
    case "shipment-review":
      return <ShipmentReview />;
    case "documents":
      return <DocumentsResult />;
    case "expensive":
      return <ExpensiveResult />;
    case "delays":
      return <DelaysResult />;
    case "suppliers":
      return <SuppliersResult />;
    case "compliance":
      return <ComplianceResult />;
    case "export":
      return <ExportResult />;
  }
}

