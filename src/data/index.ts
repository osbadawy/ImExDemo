import type {
  Buyer,
  Insight,
  Shipment,
  ShipmentDocument,
  Supplier,
  TimelineEvent,
} from "./types";

export const company = {
  name: "Nile Industrial Trading",
  hq: "Cairo, Egypt",
  user: { name: "Ahmed Mansour", first: "Ahmed", role: "Operations Director", initials: "AM" },
};

/* ------------------------------------------------------------------ */
/* Suppliers & buyers                                                 */
/* ------------------------------------------------------------------ */

export const suppliers: Supplier[] = [
  { id: "SUP-01", name: "Shanghai Hengli Machinery Co.", country: "China", city: "Shanghai", category: "Industrial machinery", rating: 4.6, onTimeRate: 92, avgLeadDays: 38, shipmentsYtd: 14 },
  { id: "SUP-02", name: "Shenzhen Brightway Electronics", country: "China", city: "Shenzhen", category: "Electronic components", rating: 4.1, onTimeRate: 86, avgLeadDays: 29, shipmentsYtd: 19 },
  { id: "SUP-03", name: "Ningbo Oriental Precision Parts", country: "China", city: "Ningbo", category: "Precision components", rating: 4.3, onTimeRate: 89, avgLeadDays: 33, shipmentsYtd: 11 },
  { id: "SUP-04", name: "Krüger Antriebstechnik GmbH", country: "Germany", city: "Hamburg", category: "Drive systems", rating: 4.8, onTimeRate: 96, avgLeadDays: 26, shipmentsYtd: 9 },
  { id: "SUP-05", name: "Anadolu Endüstri Makina A.Ş.", country: "Türkiye", city: "Istanbul", category: "Metalworking equipment", rating: 4.4, onTimeRate: 93, avgLeadDays: 12, shipmentsYtd: 16 },
  { id: "SUP-06", name: "Guangzhou Sinotek Automation", country: "China", city: "Guangzhou", category: "Automation & robotics", rating: 4.2, onTimeRate: 88, avgLeadDays: 35, shipmentsYtd: 7 },
  { id: "SUP-07", name: "Milano Fluidtech S.r.l.", country: "Italy", city: "Genoa", category: "Pumps & valves", rating: 4.5, onTimeRate: 94, avgLeadDays: 18, shipmentsYtd: 8 },
  { id: "SUP-08", name: "Busan Daewon Hydraulics", country: "South Korea", city: "Busan", category: "Hydraulic systems", rating: 4.7, onTimeRate: 95, avgLeadDays: 31, shipmentsYtd: 6 },
];

export const buyers: Buyer[] = [
  { id: "BUY-01", name: "Van der Berg Interiors B.V.", country: "Netherlands", city: "Rotterdam", segment: "Office furniture distribution", annualVolume: "$1.1M" },
  { id: "BUY-02", name: "Al Noor Trading LLC", country: "UAE", city: "Dubai", segment: "Home furniture retail", annualVolume: "$1.6M" },
  { id: "BUY-03", name: "Gulf Build Supplies Co.", country: "Saudi Arabia", city: "Jeddah", segment: "Construction materials", annualVolume: "$2.3M" },
  { id: "BUY-04", name: "Hansa Möbel Handels GmbH", country: "Germany", city: "Hamburg", segment: "Contract seating", annualVolume: "$0.8M" },
  { id: "BUY-05", name: "Riyadh Home Furnishings Co.", country: "Saudi Arabia", city: "Riyadh", segment: "Residential furniture", annualVolume: "$1.3M" },
];

export const partnerName = (id: string) =>
  suppliers.find((s) => s.id === id)?.name ?? buyers.find((b) => b.id === id)?.name ?? id;

/* ------------------------------------------------------------------ */
/* Shipments                                                          */
/* ------------------------------------------------------------------ */

type Seed = Omit<Shipment, "freight" | "portFeesEgp" | "otherEgp" | "dutyRate"> &
  Partial<Pick<Shipment, "freight" | "portFeesEgp" | "otherEgp" | "dutyRate">>;

const build = (s: Seed): Shipment => ({
  freight: Math.round((s.value * 0.042) / 50) * 50 + 2400,
  portFeesEgp: Math.round((60000 + s.value * 0.32) / 1000) * 1000,
  otherEgp: Math.round((28000 + s.value * 0.12) / 1000) * 1000,
  dutyRate: 5,
  ...s,
});

export const shipments: Shipment[] = [
  build({ id: "IMP-2026-048", direction: "import", partnerId: "SUP-02", origin: "Shenzhen", originCountry: "China", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Industrial PLC control modules", category: "Electronic components", value: 187000, quantity: 850, unit: "units", incoterm: "FOB Shenzhen", mode: "Sea · FCL", container: "1 × 40' HC", carrier: "COSCO Shipping", departure: "2026-11-06", eta: "2026-12-02", status: "Action Required", stage: 2, risk: "high", riskNote: "Quantity mismatch between invoice and packing list", freight: 6800, portFeesEgp: 118000, otherEgp: 52000, dutyRate: 5 }),
  build({ id: "IMP-2026-032", direction: "import", partnerId: "SUP-04", origin: "Hamburg", originCountry: "Germany", destination: "Alexandria", destinationCountry: "Egypt", product: "Industrial gear drives & servo motors", category: "Industrial machinery", value: 238500, quantity: 64, unit: "units", incoterm: "FOB Hamburg", mode: "Sea · FCL", container: "2 × 20' DV", carrier: "Hapag-Lloyd", departure: "2026-10-24", eta: "2026-11-18", status: "At Port", stage: 3, risk: "high", riskNote: "Terminal free time ends 26 Nov — demurrage risk", freight: 7400, portFeesEgp: 164000, otherEgp: 61000 }),
  build({ id: "IMP-2026-051", direction: "import", partnerId: "SUP-01", origin: "Shanghai", originCountry: "China", destination: "Alexandria", destinationCountry: "Egypt", product: "CNC vertical machining centers", category: "Industrial machinery", value: 412000, quantity: 4, unit: "units", incoterm: "FOB Shanghai", mode: "Sea · FCL", container: "2 × 40' HC", carrier: "MSC", departure: "2026-11-14", eta: "2026-12-09", status: "In Transit", stage: 2, risk: "medium", riskNote: "Freight rate 25% above alternative quotation", freight: 14200, portFeesEgp: 285000, otherEgp: 96000, dutyRate: 5 }),
  build({ id: "IMP-2026-044", direction: "import", partnerId: "SUP-05", origin: "Istanbul", originCountry: "Türkiye", destination: "Port Said", destinationCountry: "Egypt", product: "Hydraulic press components", category: "Metalworking equipment", value: 96800, quantity: 120, unit: "units", incoterm: "CFR Port Said", mode: "Sea · FCL", container: "1 × 40' DV", carrier: "Arkas Line", departure: "2026-11-17", eta: "2026-11-27", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "IMP-2026-039", direction: "import", partnerId: "SUP-03", origin: "Ningbo", originCountry: "China", destination: "Alexandria", destinationCountry: "Egypt", product: "Precision bearings & bushings", category: "Precision components", value: 54200, quantity: 18000, unit: "pcs", incoterm: "FOB Ningbo", mode: "Sea · LCL", container: "LCL · 14 CBM", carrier: "Evergreen", departure: "2026-10-12", eta: "2026-11-15", status: "Customs Clearance", stage: 4, risk: "medium", riskNote: "Certificate of origin awaiting legalization" }),
  build({ id: "IMP-2026-046", direction: "import", partnerId: "SUP-07", origin: "Genoa", originCountry: "Italy", destination: "Alexandria", destinationCountry: "Egypt", product: "Industrial pumps & valves", category: "Pumps & valves", value: 128400, quantity: 210, unit: "units", incoterm: "FCA Genoa", mode: "Sea · FCL", container: "1 × 40' DV", carrier: "Grimaldi", departure: "2026-11-19", eta: "2026-11-29", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "IMP-2026-041", direction: "import", partnerId: "SUP-08", origin: "Busan", originCountry: "South Korea", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Hydraulic cylinders", category: "Hydraulic systems", value: 142600, quantity: 340, unit: "units", incoterm: "FOB Busan", mode: "Sea · FCL", container: "2 × 20' DV", carrier: "HMM", departure: "2026-10-16", eta: "2026-11-16", status: "Customs Clearance", stage: 4, risk: "low" }),
  build({ id: "IMP-2026-049", direction: "import", partnerId: "SUP-06", origin: "Guangzhou", originCountry: "China", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Robotic arm assemblies", category: "Automation & robotics", value: 268000, quantity: 12, unit: "units", incoterm: "FOB Nansha", mode: "Sea · FCL", container: "1 × 40' HC", carrier: "CMA CGM", departure: "2026-11-28", eta: "2026-12-24", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "IMP-2026-050", direction: "import", partnerId: "SUP-02", origin: "Shenzhen", originCountry: "China", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Variable frequency drives", category: "Electronic components", value: 78900, quantity: 420, unit: "units", incoterm: "FOB Shenzhen", mode: "Sea · LCL", container: "LCL · 9 CBM", carrier: "ONE", departure: "2026-11-12", eta: "2026-12-05", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "IMP-2026-045", direction: "import", partnerId: "SUP-01", origin: "Shanghai", originCountry: "China", destination: "Alexandria", destinationCountry: "Egypt", product: "Industrial air compressors", category: "Industrial machinery", value: 121500, quantity: 18, unit: "units", incoterm: "FOB Shanghai", mode: "Sea · FCL", container: "1 × 40' HC", carrier: "Maersk", departure: "2026-11-04", eta: "2026-11-30", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "IMP-2026-052", direction: "import", partnerId: "SUP-04", origin: "Hamburg", originCountry: "Germany", destination: "Alexandria", destinationCountry: "Egypt", product: "Conveyor drive systems", category: "Drive systems", value: 84300, quantity: 26, unit: "units", incoterm: "FOB Hamburg", mode: "Sea · FCL", container: "1 × 20' DV", carrier: "Hapag-Lloyd", departure: "2026-11-30", eta: "2026-12-22", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "IMP-2026-047", direction: "import", partnerId: "SUP-05", origin: "Istanbul", originCountry: "Türkiye", destination: "Port Said", destinationCountry: "Egypt", product: "Sheet metal bending tools", category: "Metalworking equipment", value: 38700, quantity: 45, unit: "units", incoterm: "CFR Port Said", mode: "Sea · LCL", container: "LCL · 6 CBM", carrier: "Arkas Line", departure: "2026-11-11", eta: "2026-11-21", status: "At Port", stage: 3, risk: "low" }),
  build({ id: "IMP-2026-043", direction: "import", partnerId: "SUP-03", origin: "Ningbo", originCountry: "China", destination: "Alexandria", destinationCountry: "Egypt", product: "Linear guide rails", category: "Precision components", value: 46900, quantity: 2400, unit: "pcs", incoterm: "FOB Ningbo", mode: "Sea · LCL", container: "LCL · 8 CBM", carrier: "Evergreen", departure: "2026-10-18", eta: "2026-11-19", status: "Customs Clearance", stage: 4, risk: "low" }),
  build({ id: "IMP-2026-053", direction: "import", partnerId: "SUP-08", origin: "Busan", originCountry: "South Korea", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Hydraulic power units", category: "Hydraulic systems", value: 112000, quantity: 30, unit: "units", incoterm: "FOB Busan", mode: "Sea · FCL", container: "1 × 40' DV", carrier: "HMM", departure: "2026-12-01", eta: "2026-12-28", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "IMP-2026-040", direction: "import", partnerId: "SUP-07", origin: "Genoa", originCountry: "Italy", destination: "Alexandria", destinationCountry: "Egypt", product: "Stainless process valves", category: "Pumps & valves", value: 67300, quantity: 640, unit: "units", incoterm: "FCA Genoa", mode: "Sea · FCL", container: "1 × 20' DV", carrier: "Grimaldi", departure: "2026-11-09", eta: "2026-11-20", status: "At Port", stage: 3, risk: "medium", riskNote: "Inspection appointment not yet scheduled" }),
  build({ id: "IMP-2026-054", direction: "import", partnerId: "SUP-02", origin: "Shenzhen", originCountry: "China", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "Industrial sensor arrays", category: "Electronic components", value: 59400, quantity: 1600, unit: "units", incoterm: "FOB Shenzhen", mode: "Sea · LCL", container: "LCL · 7 CBM", carrier: "COSCO Shipping", departure: "2026-11-29", eta: "2026-12-23", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "IMP-2026-042", direction: "import", partnerId: "SUP-06", origin: "Guangzhou", originCountry: "China", destination: "Ain Sokhna", destinationCountry: "Egypt", product: "PLC panels & HMI screens", category: "Automation & robotics", value: 93600, quantity: 85, unit: "units", incoterm: "FOB Nansha", mode: "Sea · FCL", container: "1 × 20' DV", carrier: "CMA CGM", departure: "2026-10-20", eta: "2026-11-17", status: "Customs Clearance", stage: 4, risk: "low" }),
  build({ id: "IMP-2026-055", direction: "import", partnerId: "SUP-01", origin: "Shanghai", originCountry: "China", destination: "Alexandria", destinationCountry: "Egypt", product: "Injection molding machines", category: "Industrial machinery", value: 176000, quantity: 2, unit: "units", incoterm: "FOB Shanghai", mode: "Sea · FCL", container: "1 × 40' FR", carrier: "MSC", departure: "2026-12-03", eta: "2026-12-29", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "EXP-2026-017", direction: "export", partnerId: "BUY-01", origin: "Alexandria", originCountry: "Egypt", destination: "Rotterdam", destinationCountry: "Netherlands", product: "Steel-frame office furniture", category: "Furniture", value: 142000, quantity: 1200, unit: "units", incoterm: "CIF Rotterdam", mode: "Sea · FCL", container: "3 × 40' HC", carrier: "Maersk", departure: "2026-11-15", eta: "2026-12-04", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "EXP-2026-018", direction: "export", partnerId: "BUY-02", origin: "Damietta", originCountry: "Egypt", destination: "Jebel Ali", destinationCountry: "UAE", product: "Solid wood furniture sets", category: "Furniture", value: 164500, quantity: 380, unit: "sets", incoterm: "CFR Jebel Ali", mode: "Sea · FCL", container: "4 × 40' HC", carrier: "MSC", departure: "2026-11-13", eta: "2026-11-29", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "EXP-2026-015", direction: "export", partnerId: "BUY-03", origin: "Alexandria", originCountry: "Egypt", destination: "Jeddah", destinationCountry: "Saudi Arabia", product: "Galvanized steel profiles", category: "Fabricated metal", value: 189000, quantity: 210, unit: "tons", incoterm: "CFR Jeddah", mode: "Sea · FCL", container: "8 × 20' DV", carrier: "CMA CGM", departure: "2026-11-12", eta: "2026-11-20", status: "At Port", stage: 3, risk: "low" }),
  build({ id: "EXP-2026-019", direction: "export", partnerId: "BUY-04", origin: "Alexandria", originCountry: "Egypt", destination: "Hamburg", destinationCountry: "Germany", product: "Upholstered contract seating", category: "Furniture", value: 98400, quantity: 640, unit: "units", incoterm: "FOB Alexandria", mode: "Sea · FCL", container: "2 × 40' HC", carrier: "Hapag-Lloyd", departure: "2026-11-27", eta: "2026-12-14", status: "Booked", stage: 0, risk: "low" }),
  build({ id: "EXP-2026-016", direction: "export", partnerId: "BUY-05", origin: "Damietta", originCountry: "Egypt", destination: "Dammam", destinationCountry: "Saudi Arabia", product: "Bedroom furniture collections", category: "Furniture", value: 121800, quantity: 260, unit: "sets", incoterm: "CFR Dammam", mode: "Sea · FCL", container: "3 × 40' HC", carrier: "ONE", departure: "2026-11-10", eta: "2026-11-26", status: "In Transit", stage: 2, risk: "low" }),
  build({ id: "EXP-2026-020", direction: "export", partnerId: "BUY-01", origin: "Alexandria", originCountry: "Egypt", destination: "Rotterdam", destinationCountry: "Netherlands", product: "Metal shelving systems", category: "Fabricated metal", value: 72600, quantity: 900, unit: "units", incoterm: "CIF Rotterdam", mode: "Sea · FCL", container: "2 × 40' DV", carrier: "Maersk", departure: "2026-12-02", eta: "2026-12-20", status: "Booked", stage: 0, risk: "low" }),
];

export const getShipment = (id: string) => shipments.find((s) => s.id === id);

export const featuredShipmentIds = [
  "IMP-2026-048",
  "IMP-2026-032",
  "IMP-2026-051",
  "IMP-2026-039",
  "IMP-2026-044",
  "EXP-2026-017",
  "IMP-2026-046",
  "EXP-2026-018",
];

export const stages = ["Booked", "Departed", "In transit", "Arrived", "Customs", "Delivered"];

/* ------------------------------------------------------------------ */
/* Documents                                                          */
/* ------------------------------------------------------------------ */

const docBase = [
  { name: "Commercial Invoice.pdf", type: "Commercial invoice", pages: 2, size: "184 KB" },
  { name: "Packing List.pdf", type: "Packing list", pages: 3, size: "212 KB" },
  { name: "Bill of Lading.pdf", type: "Bill of lading", pages: 2, size: "356 KB" },
  { name: "Certificate of Origin.pdf", type: "Certificate of origin", pages: 1, size: "128 KB" },
  { name: "Purchase Order.pdf", type: "Purchase order", pages: 2, size: "96 KB" },
];

export function documentsFor(s: Shipment): ShipmentDocument[] {
  const uploaded = s.departure;
  if (s.id === "IMP-2026-048") {
    const st: ShipmentDocument["status"][] = ["in-review", "in-review", "verified", "in-review", "verified"];
    return docBase.map((d, i) => ({ ...d, status: st[i], uploaded: ["2026-11-07", "2026-11-07", "2026-11-08", "2026-11-10", "2026-10-21"][i] }));
  }
  if (s.id === "IMP-2026-039") {
    return docBase.map((d, i) => ({ ...d, status: i === 3 ? "missing" : "verified", uploaded }));
  }
  if (s.stage === 0) {
    return docBase.map((d, i) => ({ ...d, status: i === 2 ? "missing" : i === 4 ? "verified" : "in-review", uploaded }));
  }
  if (s.stage <= 2) {
    return docBase.map((d, i) => ({ ...d, status: i === 3 ? "in-review" : "verified", uploaded }));
  }
  return docBase.map((d) => ({ ...d, status: "verified", uploaded }));
}

/* ------------------------------------------------------------------ */
/* Timeline                                                           */
/* ------------------------------------------------------------------ */

const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function timelineFor(s: Shipment): TimelineEvent[] {
  const exp = s.direction === "export";
  const events: TimelineEvent[] = [
    { date: addDays(s.departure, -9), title: "Booking confirmed", detail: `${s.carrier} · ${s.container}`, done: true },
    { date: addDays(s.departure, -2), title: exp ? "Export clearance completed" : "Cargo received at origin", detail: `${s.origin} terminal`, done: s.stage >= 1 },
    { date: s.departure, title: "Vessel departed", detail: `${s.origin} → ${s.destination}`, done: s.stage >= 1 },
    { date: s.eta, title: "Arrival at destination port", detail: `${s.destination}, ${s.destinationCountry}`, done: s.stage >= 3 },
    { date: addDays(s.eta, 3), title: exp ? "Import clearance at destination" : "Customs clearance", detail: exp ? "Handled by buyer's broker" : "Broker: Delta Clearance Services", done: s.stage >= 5 },
    { date: addDays(s.eta, 6), title: exp ? "Delivered to buyer" : "Delivered to 10th of Ramadan warehouse", detail: "Final mile", done: s.stage >= 5 },
  ];
  if (s.id === "IMP-2026-032") {
    events.splice(4, 0, { date: "2026-11-26", title: "Terminal free time expires", detail: "Demurrage charges start after this date", done: false });
  }
  return events;
}

/* ------------------------------------------------------------------ */
/* Landed cost model (hypothetical, user-editable assumptions)        */
/* ------------------------------------------------------------------ */

export interface CostInputs {
  value: number;
  freight: number;
  fx: number; // EGP per USD
  dutyRate: number; // %
  vatRate: number; // %
  portFeesEgp: number;
  otherEgp: number;
  insuranceRate: number; // %
}

export function landedCost(i: CostInputs) {
  const insurance = ((i.value + i.freight) * i.insuranceRate) / 100;
  const cif = i.value + i.freight + insurance;
  const duty = (cif * i.dutyRate) / 100;
  const taxes = ((cif + duty) * i.vatRate) / 100;
  const port = i.portFeesEgp / i.fx;
  const other = i.otherEgp / i.fx;
  const total = cif + duty + taxes + port + other;
  return {
    lines: [
      { key: "value", label: "Product purchase value", usd: i.value },
      { key: "freight", label: "Ocean freight", usd: i.freight },
      { key: "insurance", label: "Cargo insurance", usd: insurance },
      { key: "duty", label: "Estimated customs duty", usd: duty },
      { key: "taxes", label: "Estimated taxes (VAT)", usd: taxes },
      { key: "port", label: "Port & handling", usd: port },
      { key: "other", label: "Clearance, inland & other", usd: other },
    ],
    cif,
    total,
    totalEgp: total * i.fx,
    overhead: total - i.value,
    overheadPct: ((total - i.value) / i.value) * 100,
  };
}

export const defaultFx = 48.6;
export const handlingBenchmarkEgp = 210000;

export const costInputsFor = (s: Shipment): CostInputs => ({
  value: s.value,
  freight: s.freight,
  fx: defaultFx,
  dutyRate: s.dutyRate,
  vatRate: 14,
  portFeesEgp: s.portFeesEgp,
  otherEgp: s.otherEgp,
  insuranceRate: 0.5,
});

/* ------------------------------------------------------------------ */
/* Overview data                                                      */
/* ------------------------------------------------------------------ */

export const kpis = [
  { id: "active", label: "Active shipments", value: "24", delta: "+3 vs last month", trend: "up" as const, spark: [16, 18, 17, 19, 20, 21, 20, 22, 23, 24] },
  { id: "attention", label: "Requiring attention", value: "5", delta: "2 high priority", trend: "warn" as const, spark: [3, 4, 2, 3, 5, 4, 3, 4, 6, 5] },
  { id: "value", label: "Monthly import value", value: "$1.24M", delta: "+8.4% vs October", trend: "up" as const, spark: [0.86, 0.92, 0.95, 1.01, 0.98, 1.06, 1.1, 1.08, 1.15, 1.24] },
  { id: "avoided", label: "Estimated costs avoided", value: "$18,450", delta: "Last 30 days", trend: "good" as const, spark: [2.1, 3.4, 4.8, 6.2, 7.9, 9.5, 11.8, 13.6, 16.2, 18.45] },
];

export const activitySeries = [
  { week: "Sep 7", arrivals: 3, departures: 4, value: 0.21 },
  { week: "Sep 14", arrivals: 4, departures: 3, value: 0.26 },
  { week: "Sep 21", arrivals: 3, departures: 5, value: 0.24 },
  { week: "Sep 28", arrivals: 5, departures: 4, value: 0.31 },
  { week: "Oct 5", arrivals: 4, departures: 6, value: 0.28 },
  { week: "Oct 12", arrivals: 6, departures: 5, value: 0.36 },
  { week: "Oct 19", arrivals: 5, departures: 6, value: 0.33 },
  { week: "Oct 26", arrivals: 7, departures: 5, value: 0.41 },
  { week: "Nov 2", arrivals: 6, departures: 7, value: 0.38 },
  { week: "Nov 9", arrivals: 8, departures: 6, value: 0.46 },
  { week: "Nov 16", arrivals: 7, departures: 8, value: 0.44 },
  { week: "Nov 23", arrivals: 9, departures: 6, value: 0.52 },
  { week: "Nov 30", arrivals: 6, departures: 5, value: 0.39, forecast: true },
  { week: "Dec 7", arrivals: 7, departures: 4, value: 0.42, forecast: true },
];

export const insights: Insight[] = [
  {
    id: "ins-1",
    kind: "document",
    title: "Potential document discrepancy detected",
    body: "Shipment IMP-2026-048 has inconsistent quantities between the commercial invoice and packing list.",
    shipmentId: "IMP-2026-048",
    impact: "Customs hold risk",
    severity: "high",
    href: "/documents?shipment=IMP-2026-048",
    cta: "Review documents",
  },
  {
    id: "ins-2",
    kind: "deadline",
    title: "Container deadline approaching",
    body: "Shipment IMP-2026-032 reaches the end of terminal free time in 3 days. Clearance is not yet complete.",
    shipmentId: "IMP-2026-032",
    impact: "≈ $1,150/day demurrage",
    severity: "high",
    href: "/shipments/IMP-2026-032",
    cta: "View shipment",
  },
  {
    id: "ins-3",
    kind: "freight",
    title: "Freight optimization opportunity",
    body: "An alternative quotation for IMP-2026-051 could reduce estimated shipping costs by about 20%.",
    shipmentId: "IMP-2026-051",
    impact: "Save ≈ $2,850",
    severity: "medium",
    href: "/costs?shipment=IMP-2026-051",
    cta: "Open cost analysis",
  },
];

export const notifications = [
  { id: 1, title: "Document review flagged 3 items", body: "IMP-2026-048 · Document Intelligence", time: "12m ago", unread: true },
  { id: 2, title: "Free time ends in 3 days", body: "IMP-2026-032 · Logistics Agent", time: "1h ago", unread: true },
  { id: 3, title: "New freight quotation received", body: "IMP-2026-051 · Financial Intelligence", time: "3h ago", unread: true },
  { id: 4, title: "EXP-2026-015 arrived in Jeddah", body: "Logistics Agent", time: "Yesterday", unread: false },
];
