import { documentsFor, landedCost, costInputsFor, partnerName } from "@/data";
import type { Shipment } from "@/data/types";
import type { SimStep } from "./simulation";
import { usd } from "./format";

export interface Finding {
  severity: "high" | "medium" | "low" | "ok";
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

/** Deterministic mock analysis for any shipment. */
export function shipmentAnalysis(s: Shipment): { steps: SimStep[]; findings: Finding[]; summary: string } {
  const docs = documentsFor(s);
  const lc = landedCost(costInputsFor(s));
  const steps: SimStep[] = [
    { label: "Loading shipment record", logs: [`${s.id} · ${s.product}`, `${s.origin} → ${s.destination} · ${s.carrier}`], ms: 900 },
    { label: "Reviewing documents", logs: [`${docs.length} documents found`, docs.some((d) => d.status === "missing") ? "One required document not yet uploaded" : "All required document types present"], ms: 1100 },
    { label: "Checking milestones & deadlines", logs: [`ETA ${s.eta}`, s.stage >= 3 ? "Cargo at destination port" : "Vessel on planned route"], ms: 1000 },
    { label: "Estimating landed cost", logs: [`Purchase value ${usd(s.value)}`, `Estimated landed cost ${usd(lc.total)}`], ms: 1000 },
    { label: "Assessing supplier history", logs: [`${partnerName(s.partnerId)}`, "Historical performance loaded"], ms: 800 },
    { label: "Compiling recommendations", logs: ["Ranking findings by urgency"], ms: 700 },
  ];

  const f: Finding[] = [];
  if (s.id === "IMP-2026-048") {
    f.push({ severity: "high", title: "Quantity mismatch between invoice and packing list", detail: "Commercial invoice lists 850 units; packing list lists 800 units.", action: { label: "Open document analysis", href: "/documents?shipment=IMP-2026-048" } });
    f.push({ severity: "medium", title: "ACID reference not detected on packing list", detail: "Verify before customs submission at Ain Sokhna.", action: { label: "Review documents", href: "/documents?shipment=IMP-2026-048" } });
    f.push({ severity: "low", title: "HS classification may need verification", detail: "Product description could fit more than one heading. Flag for a licensed broker.", action: { label: "Run compliance check", href: "/workspace?task=compliance" } });
  } else if (s.id === "IMP-2026-032") {
    f.push({ severity: "high", title: "Terminal free time ends 26 Nov", detail: "Customs declaration not yet filed. Estimated demurrage ≈ $1,150/day after expiry.", action: { label: "Find all delay risks", href: "/workspace?task=delays" } });
    f.push({ severity: "low", title: "Documents complete", detail: "All 5 documents verified and consistent." });
  } else if (s.id === "IMP-2026-051") {
    f.push({ severity: "medium", title: "Freight 25% above alternative quotation", detail: "Alternative sample quote: $11,350 vs booked $14,200.", action: { label: "Open cost analysis", href: "/costs?shipment=IMP-2026-051" } });
    f.push({ severity: "medium", title: "Port & handling above internal benchmark", detail: "Estimated EGP 285,000 vs EGP 210,000 benchmark.", action: { label: "Open cost analysis", href: "/costs?shipment=IMP-2026-051" } });
  } else if (s.id === "IMP-2026-039") {
    f.push({ severity: "medium", title: "Certificate of origin awaiting legalization", detail: "Clearance cannot complete until the certificate is uploaded.", action: { label: "Find delay risks", href: "/workspace?task=delays" } });
  } else if (s.id === "IMP-2026-040") {
    f.push({ severity: "medium", title: "Inspection appointment not booked", detail: "Arrived 20 Nov. Booking for 25 Nov avoids a 2–3 day slip.", action: { label: "Find delay risks", href: "/workspace?task=delays" } });
  } else {
    f.push({ severity: "ok", title: "No discrepancies detected", detail: "Documents, schedule and cost structure are within expected ranges." });
    if (s.direction === "import")
      f.push({ severity: "low", title: "Landed cost within benchmark", detail: `Overhead ${lc.overheadPct.toFixed(1)}% above purchase value.`, action: { label: "Open cost analysis", href: `/costs?shipment=${s.id}` } });
    else f.push({ severity: "low", title: "Buyer payment terms on track", detail: "Letter of credit confirmed; no outstanding documentary requirements." });
  }

  const issues = f.filter((x) => x.severity === "high" || x.severity === "medium").length;
  const summary = issues ? `${issues} item${issues > 1 ? "s" : ""} need${issues > 1 ? "" : "s"} attention` : "Shipment looks healthy";
  return { steps, findings: f, summary };
}
