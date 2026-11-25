"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Mail,
  RotateCcw,
  ScanSearch,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LogStream, StepList } from "@/components/agent-execution";
import { EmailPanel, type DraftEmail } from "@/components/email-panel";
import { AgentAvatar, Button, Card, DocStatusPill, PageHeader } from "@/components/ui";
import { documentsFor, getShipment, partnerName, shipments } from "@/data";
import type { DocStatus } from "@/data/types";
import { cn, dateLong, num, usd } from "@/lib/format";
import { useSimulation, type SimStep } from "@/lib/simulation";

const BRAND = "#4f5bd5";

const docSteps: SimStep[] = [
  { label: "Reading uploaded documents", logs: ["Opened Commercial Invoice.pdf (2 pages)", "Opened Packing List.pdf (3 pages)", "Opened Bill of Lading, Certificate of Origin, Purchase Order"], ms: 1300 },
  { label: "Extracting supplier and shipment details", logs: ["Supplier: Shenzhen Brightway Electronics", "Consignee: Nile Industrial Trading, Cairo", "Extracted 142 fields across 5 documents"], ms: 1200 },
  { label: "Cross-referencing document fields", logs: ["Matching invoice no. SBE-INV-26-1187 across documents", "Consignee and notify party consistent"], ms: 1100 },
  { label: "Validating quantity consistency", logs: ["Invoice: 850 units · Packing list: 800 units", "Mismatch detected · Δ 50 units"], ms: 1200 },
  { label: "Checking shipment references", logs: ["B/L COSU6284519730 matches booking", "ACID reference found on invoice, not on packing list"], ms: 1100 },
  { label: "Reviewing possible compliance issues", logs: ["HS 8537.10 declared · description partly fits 8538", "Flagged for professional verification"], ms: 1100 },
  { label: "Generating final report", logs: ["3 potential issues · 1 confirmed mismatch", "Recommendation prepared"], ms: 900 },
];

const cleanSteps = (id: string): SimStep[] => [
  { label: "Reading uploaded documents", logs: [`Opened 5 documents for ${id}`], ms: 1200 },
  { label: "Extracting supplier and shipment details", logs: ["Extracted 128 fields"], ms: 1100 },
  { label: "Cross-referencing document fields", logs: ["Invoice, packing list and B/L references consistent"], ms: 1100 },
  { label: "Validating quantity consistency", logs: ["Quantities and gross weights match"], ms: 1000 },
  { label: "Checking shipment references", logs: ["ACID reference present on all documents"], ms: 1000 },
  { label: "Reviewing possible compliance issues", logs: ["No classification concerns detected"], ms: 1000 },
  { label: "Generating final report", logs: ["Report ready"], ms: 800 },
];

// Which document each step is "reading"
const stepDocs = [[0, 1, 2, 3, 4], [0, 1], [0, 1, 2], [0, 1], [0, 1, 2], [0, 3], [0, 1, 2, 3, 4]];

const email048: DraftEmail = {
  to: "Li Wei <export@brightway-elec.example>",
  cc: "Ahmed Mansour <ahmed.mansour@nileindustrial.example>",
  subject: "IMP-2026-048 · Request for corrected shipping documents (PO NIT-PO-2026-311)",
  body: `Dear Mr. Li,

Thank you for dispatching our order of industrial PLC control modules (PO NIT-PO-2026-311), currently on board COSCO Shipping under B/L COSU6284519730 to Ain Sokhna, ETA 2 December 2026.

During our document review we identified the following items that need your attention before customs submission:

1. Quantity discrepancy — The commercial invoice (SBE-INV-26-1187) states 850 units, while the packing list states 800 units. Please confirm the quantity actually shipped and issue a corrected invoice or packing list accordingly.

2. ACID reference — The ACID number is shown on the commercial invoice but not on the packing list. Please add it so that all documents carry the same reference.

3. Product description — To support correct classification, please provide a more detailed technical description (function, I/O configuration and intended use) of the modules.

As the vessel arrives in about nine days, we would be grateful to receive the corrected documents by 28 November 2026.

Thank you for your continued cooperation.

Kind regards,
Ahmed Mansour
Operations Director
Nile Industrial Trading · Cairo, Egypt`,
};

export function DocumentsView({ shipmentId }: { shipmentId?: string }) {
  const router = useRouter();
  const imports = shipments.filter((s) => s.direction === "import");
  const id = shipmentId ?? "IMP-2026-048";
  const s = getShipment(id) ?? getShipment("IMP-2026-048")!;
  const is048 = s.id === "IMP-2026-048";
  const steps = useMemo(() => (is048 ? docSteps : cleanSteps(s.id)), [is048, s.id]);
  const sim = useSimulation(steps);
  const [emailOpen, setEmailOpen] = useState(false);
  const [picker, setPicker] = useState(false);

  const baseDocs = documentsFor(s);
  const docs = baseDocs.map((d, i) => {
    let status: DocStatus = d.status;
    if (sim.status === "complete") {
      if (is048) status = i === 0 || i === 1 ? "issue" : "verified";
      else status = d.status === "missing" ? "missing" : "verified";
    }
    return { ...d, status };
  });
  const scanning = sim.status === "running" ? stepDocs[sim.step] ?? [] : [];

  const switchShipment = (nid: string) => {
    sim.reset();
    setPicker(false);
    router.replace(`/documents?shipment=${nid}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Document Intelligence"
        subtitle="AI review of shipping documents for discrepancies, missing references and compliance flags."
        actions={
          <div className="relative">
            <Button onClick={() => setPicker((p) => !p)}>
              <span className="text-ink-3">Shipment</span> <span className="tabular">{s.id}</span> <ChevronDown className="size-3.5 text-ink-3" />
            </Button>
            <AnimatePresence>
              {picker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPicker(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="scrollbar-thin absolute right-0 top-11 z-50 max-h-[360px] w-[320px] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-pop"
                  >
                    {imports.map((x) => (
                      <button key={x.id} onClick={() => switchShipment(x.id)} className={cn("flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-canvas cursor-pointer", x.id === s.id && "bg-canvas")}>
                        <span className="text-[13px] font-medium tabular">{x.id}</span>
                        <span className="truncate text-xs text-ink-3">{x.product}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* Shipment context */}
      <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 text-[13px]">
        <Link href={`/shipments/${s.id}`} className="font-semibold text-ink hover:text-brand tabular">{s.id}</Link>
        <Meta k="Supplier" v={partnerName(s.partnerId)} />
        <Meta k="Route" v={`${s.origin} → ${s.destination}`} />
        <Meta k="Value" v={usd(s.value)} />
        <Meta k="Quantity (PO)" v={`${num(s.quantity)} ${s.unit}`} />
        <Meta k="ETA" v={dateLong(s.eta)} />
      </Card>

      {/* Documents */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {docs.map((d, i) => {
            const active = scanning.includes(i);
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "card relative overflow-hidden p-4 transition-all duration-500",
                  active && "border-brand/40 shadow-[0_0_0_4px_rgba(79,91,213,0.08)]",
                  sim.status === "complete" && d.status === "issue" && "border-rose/30"
                )}
              >
                {active && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-brand/10 to-transparent"
                    initial={{ top: "-30%" }}
                    animate={{ top: ["-30%", "100%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="relative grid h-11 w-9 place-items-center rounded-md border border-line bg-canvas">
                      <FileText className="size-4 text-ink-3" strokeWidth={1.6} />
                      <span className="absolute -bottom-1 -right-1.5 rounded bg-rose px-1 text-[8px] font-bold text-white">PDF</span>
                    </div>
                    {active ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-brand">
                        <ScanSearch className="size-3.5" /> Reading
                      </span>
                    ) : sim.status === "complete" && d.status === "verified" ? (
                      <CheckCircle2 className="size-4 text-mint" />
                    ) : sim.status === "complete" && d.status === "issue" ? (
                      <AlertTriangle className="size-4 text-rose" />
                    ) : null}
                  </div>
                  <div className="truncate text-[13.5px] font-medium text-ink">{d.name}</div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {d.pages} pages · {d.size}
                  </div>
                  <div className="mt-3">
                    <DocStatusPill status={d.status} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Connector lines */}
        <AnimatePresence>
          {sim.status !== "idle" && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              viewBox="0 0 1000 70"
              preserveAspectRatio="none"
              className="hidden h-[70px] w-full lg:block"
            >
              {[100, 300, 500, 700, 900].map((x, i) => (
                <path
                  key={x}
                  d={`M${x} 0 C ${x} 40, 500 30, 500 70`}
                  fill="none"
                  stroke={scanning.includes(i) ? BRAND : "#dddad3"}
                  strokeWidth={scanning.includes(i) ? 1.6 : 1}
                  className={sim.status === "running" ? "flow-line" : ""}
                  style={{ transition: "stroke 0.4s" }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Launch / execution */}
      <AnimatePresence mode="wait">
        {sim.status === "idle" ? (
          <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_200px_at_50%_0%,rgba(79,91,213,0.08),transparent)]" />
              <div className="relative flex flex-col items-center px-6 py-10 text-center">
                <AgentAvatar agent="document" color={BRAND} size={52} />
                <h2 className="mt-4 text-[19px] font-semibold tracking-tight">Document Intelligence Agent</h2>
                <p className="mt-1 max-w-[460px] text-[14px] text-ink-3">
                  Cross-checks quantities, references and product data across all {docs.length} documents, then drafts any correction requests.
                </p>
                <Button variant="primary" size="lg" icon={Sparkles} className="mt-6" onClick={sim.start}>
                  Analyze Documents with AI
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="exec" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
                <AgentAvatar agent="document" color={BRAND} state={sim.status === "running" ? "working" : "complete"} size={42} />
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">Document Intelligence Agent</div>
                  <div className="text-[13px] text-ink-3">
                    {sim.status === "running" ? (
                      <span className="shimmer-text">{steps[Math.min(sim.step, steps.length - 1)]?.label}…</span>
                    ) : (
                      `Analysis complete · ${steps.length} steps · ${(sim.totalMs / 1000).toFixed(1)}s`
                    )}
                  </div>
                </div>
                {sim.status === "complete" && (
                  <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => { sim.reset(); setTimeout(sim.start, 60); }}>
                    Restart demo
                  </Button>
                )}
              </div>
              <div className="h-[2px] bg-line/60">
                <motion.div className="h-full bg-brand" animate={{ width: `${sim.status === "complete" ? 100 : (Math.max(sim.step, 0) / steps.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <AnimatePresence initial={false}>
                {sim.status === "running" && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                      <div className="p-5">
                        <StepList steps={steps} current={sim.step} />
                      </div>
                      <div className="h-[330px] border-t border-line bg-canvas/60 md:border-l md:border-t-0">
                        <LogStream logs={sim.logs} running />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sim.status === "complete" && (is048 ? <Report048 onEmail={() => setEmailOpen(true)} /> : <CleanReport missing={docs.some((d) => d.status === "missing")} />)}
      </AnimatePresence>

      <EmailPanel open={emailOpen} onClose={() => setEmailOpen(false)} email={email048} />
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-ink-3">{k} </span>
      <span className="font-medium text-ink tabular">{v}</span>
    </div>
  );
}

function Report048({ onEmail }: { onEmail: () => void }) {
  const issues = [
    {
      n: 1,
      kind: "confirmed" as const,
      title: "Quantity mismatch",
      body: (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["Commercial invoice", "850 units", ""],
            ["Packing list", "800 units", ""],
            ["Difference", "50 units", "text-rose"],
          ].map(([k, v, c]) => (
            <div key={k} className="rounded-lg border border-line bg-canvas/50 px-3 py-2.5">
              <div className="text-[11px] text-ink-3">{k}</div>
              <div className={cn("text-[17px] font-semibold tabular", c)}>{v}</div>
            </div>
          ))}
        </div>
      ),
      note: "≈ $11,000 of invoiced value not reflected in the packing list.",
    },
    {
      n: 2,
      kind: "verify" as const,
      title: "Missing ACID reference",
      body: <p className="mt-1.5 text-[13px] text-ink-3">Required reference not detected on the packing list. It appears on the commercial invoice only.</p>,
      note: "Flag for verification before customs submission.",
    },
    {
      n: 3,
      kind: "verify" as const,
      title: "HS classification review",
      body: <p className="mt-1.5 text-[13px] text-ink-3">Declared HS 8537.10. The product description may warrant manual classification verification.</p>,
      note: "Requires review by a licensed customs broker.",
    },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-wider text-ink-4">Analysis report · IMP-2026-048</div>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight">3 potential issues detected</h2>
        </div>
        <div className="flex gap-3 text-[12px]">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose" /> 1 confirmed mismatch</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber" /> 2 need professional verification</span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {issues.map((it, i) => (
          <motion.div key={it.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i + 0.2 }} className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-4 tabular">Issue {it.n}</span>
              {it.kind === "confirmed" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose">
                  <AlertTriangle className="size-3" /> Confirmed mismatch
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber">
                  <ShieldQuestion className="size-3" /> Needs verification
                </span>
              )}
            </div>
            <div className="mt-3 text-[15px] font-semibold text-ink">{it.title}</div>
            {it.body}
            <div className="mt-auto pt-4 text-xs text-ink-3">{it.note}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="relative overflow-hidden rounded-[14px] border border-brand/20 bg-gradient-to-r from-brand-50 via-white to-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-medium uppercase tracking-wider text-brand">AI recommended action</div>
            <div className="mt-0.5 text-[16px] font-semibold text-ink">Recommended: Request corrected documentation from the supplier.</div>
            <div className="text-[13px] text-ink-3">Corrected documents by 28 Nov keep the 2 Dec arrival on track for clearance.</div>
          </div>
          <Button variant="primary" icon={Mail} onClick={onEmail}>
            Generate Supplier Email
          </Button>
        </div>
      </motion.div>
      <p className="text-xs text-ink-4">
        AI findings are decision support only. Classification and regulatory matters should be confirmed by a licensed customs broker. No documents were submitted to any authority.
      </p>
    </motion.div>
  );
}

function CleanReport({ missing }: { missing: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
      <div className={cn("grid size-11 place-items-center rounded-xl", missing ? "bg-amber-50" : "bg-mint-50")}>
        {missing ? <AlertTriangle className="size-5 text-amber" /> : <CheckCircle2 className="size-5 text-mint" />}
      </div>
      <div className="flex-1">
        <div className="text-[16px] font-semibold">{missing ? "1 required document missing" : "No discrepancies detected"}</div>
        <div className="text-[13px] text-ink-3">
          {missing ? "Certificate of origin has not been uploaded yet. All other documents are consistent." : "Quantities, references and parties are consistent across all documents."}
        </div>
      </div>
      <Link href="/documents?shipment=IMP-2026-048">
        <Button>
          Try IMP-2026-048 <ArrowRight className="size-3.5" />
        </Button>
      </Link>
    </motion.div>
  );
}
