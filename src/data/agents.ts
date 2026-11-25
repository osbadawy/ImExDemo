export type AgentId =
  | "orchestrator"
  | "document"
  | "financial"
  | "logistics"
  | "procurement"
  | "compliance"
  | "export";

export interface Agent {
  id: Exclude<AgentId, "orchestrator">;
  name: string;
  short: string;
  specialization: string;
  tasksCompleted: number;
  color: string; // hex accent
  defaultWorkflow: string;
}

export const agents: Agent[] = [
  { id: "document", name: "Document Intelligence", short: "Document", specialization: "Reviews shipping documents, detects discrepancies and drafts correction requests.", tasksCompleted: 1284, color: "#4f5bd5", defaultWorkflow: "documents" },
  { id: "financial", name: "Financial Intelligence", short: "Financial", specialization: "Analyzes landed costs, margins, unexpected charges and FX scenarios.", tasksCompleted: 642, color: "#12a594", defaultWorkflow: "expensive-imports" },
  { id: "logistics", name: "Logistics", short: "Logistics", specialization: "Monitors milestones, deadlines and delay risks across every shipment.", tasksCompleted: 2310, color: "#2f80c8", defaultWorkflow: "delays" },
  { id: "procurement", name: "Procurement", short: "Procurement", specialization: "Compares supplier quotations, Incoterms, pricing and lead times.", tasksCompleted: 418, color: "#8a5cd0", defaultWorkflow: "suppliers" },
  { id: "compliance", name: "Trade Compliance", short: "Compliance", specialization: "Reviews HS classification and flags compliance items for human review.", tasksCompleted: 905, color: "#c27c0e", defaultWorkflow: "compliance" },
  { id: "export", name: "Export Growth", short: "Export", specialization: "Identifies promising markets and buyers and drafts international outreach.", tasksCompleted: 176, color: "#d4463b", defaultWorkflow: "export" },
];

export const agentById = (id: AgentId) => agents.find((a) => a.id === id);

export interface WorkflowStep {
  label: string;
  logs: string[];
  ms: number;
}

export interface WorkflowPhase {
  agent: AgentId;
  task: string;
  steps: WorkflowStep[];
}

export type ResultKind =
  | "shipment-review"
  | "documents"
  | "expensive"
  | "delays"
  | "suppliers"
  | "compliance"
  | "export";

export interface Workflow {
  id: string;
  command: string;
  description: string;
  phases: WorkflowPhase[];
  result: ResultKind;
}

const orchestrate = (task: string, agentsList: string): WorkflowPhase => ({
  agent: "orchestrator",
  task,
  steps: [
    { label: "Interpreting request", logs: [`Parsed intent: ${task}`, "Loading Nile Industrial Trading workspace context"], ms: 900 },
    { label: "Planning agent assignments", logs: [`Routing to ${agentsList}`, "Execution plan ready"], ms: 800 },
  ],
});

const consolidate: WorkflowPhase = {
  agent: "orchestrator",
  task: "Consolidating results",
  steps: [
    { label: "Consolidating agent findings", logs: ["Merging findings from active agents", "De-duplicating overlapping signals"], ms: 900 },
    { label: "Generating final recommendation", logs: ["Ranking actions by impact and urgency", "Report ready for review"], ms: 800 },
  ],
};

export const workflows: Workflow[] = [
  {
    id: "review-048",
    command: "Review shipment IMP-2026-048",
    description: "Full multi-agent review of documents, schedule and cost exposure.",
    result: "shipment-review",
    phases: [
      orchestrate("Review shipment IMP-2026-048", "Document, Logistics and Financial agents"),
      {
        agent: "document",
        task: "Cross-checking 5 shipment documents",
        steps: [
          { label: "Reading 5 attached documents", logs: ["Commercial Invoice.pdf · 2 pages", "Packing List.pdf · 3 pages", "Bill of Lading.pdf, Certificate of Origin.pdf, Purchase Order.pdf"], ms: 1100 },
          { label: "Validating quantities and references", logs: ["Invoice qty 850 units ≠ packing list qty 800 units", "ACID reference not found on packing list"], ms: 1200 },
        ],
      },
      {
        agent: "logistics",
        task: "Checking schedule and deadlines",
        steps: [
          { label: "Tracking vessel COSCO · Shenzhen → Ain Sokhna", logs: ["Current position: Indian Ocean, on schedule", "ETA 2 Dec 2026 confirmed"], ms: 1000 },
          { label: "Projecting clearance window", logs: ["Corrected documents required before 30 Nov to avoid hold"], ms: 900 },
        ],
      },
      {
        agent: "financial",
        task: "Estimating cost exposure",
        steps: [
          { label: "Modelling landed cost", logs: ["Estimated landed cost ≈ $237K", "50-unit gap ≈ $11,000 invoice value at stake"], ms: 1000 },
          { label: "Estimating delay exposure", logs: ["Potential storage & demurrage ≈ $900/day if held"], ms: 800 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "documents",
    command: "Review my shipment documents",
    description: "Document Intelligence checks open shipments for discrepancies.",
    result: "documents",
    phases: [
      orchestrate("Review open shipment documents", "Document Intelligence agent"),
      {
        agent: "document",
        task: "Scanning document sets for 24 active shipments",
        steps: [
          { label: "Loading 118 documents across 24 shipments", logs: ["Indexed invoices, packing lists, B/Ls and certificates"], ms: 1100 },
          { label: "Cross-referencing quantities and values", logs: ["IMP-2026-048: quantity mismatch (850 vs 800)", "All other invoice/packing pairs consistent"], ms: 1300 },
          { label: "Checking required references", logs: ["IMP-2026-048: ACID reference missing on packing list", "IMP-2026-039: certificate of origin not yet uploaded"], ms: 1200 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "expensive-imports",
    command: "Find my most expensive imports",
    description: "Financial Intelligence ranks imports by estimated landed cost.",
    result: "expensive",
    phases: [
      orchestrate("Rank imports by landed cost", "Financial Intelligence agent"),
      {
        agent: "financial",
        task: "Modelling landed cost for 18 import shipments",
        steps: [
          { label: "Loading shipment values and freight", logs: ["18 import shipments · $2.39M combined purchase value"], ms: 1000 },
          { label: "Applying duty, tax and port assumptions", logs: ["Using workspace assumptions: duty 5%, VAT 14%, FX 48.60"], ms: 1200 },
          { label: "Comparing overhead against benchmark", logs: ["IMP-2026-051 port & handling 36% above benchmark", "IMP-2026-032 exposed to demurrage risk"], ms: 1200 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "delays",
    command: "Identify shipments with potential delays",
    description: "Logistics scans milestones, free time and documentation status.",
    result: "delays",
    phases: [
      orchestrate("Identify shipments with delay risk", "Logistics and Trade Compliance agents"),
      {
        agent: "logistics",
        task: "Scanning milestones for 24 active shipments",
        steps: [
          { label: "Checking vessel schedules", logs: ["22 of 24 shipments on schedule", "Hamburg → Alexandria vessel arrived 18 Nov"], ms: 1100 },
          { label: "Reviewing terminal free time", logs: ["IMP-2026-032: free time ends 26 Nov · clearance pending", "IMP-2026-040: inspection slot not booked"], ms: 1200 },
        ],
      },
      {
        agent: "compliance",
        task: "Checking documentation blockers",
        steps: [
          { label: "Reviewing clearance prerequisites", logs: ["IMP-2026-039: certificate of origin awaiting legalization"], ms: 1000 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "suppliers",
    command: "Compare suppliers for industrial components",
    description: "Procurement compares three quotations for servo drive kits.",
    result: "suppliers",
    phases: [
      orchestrate("Compare supplier quotations", "Procurement and Financial agents"),
      {
        agent: "procurement",
        task: "Analyzing 3 quotations · 200 servo drive kits",
        steps: [
          { label: "Extracting quotation terms", logs: ["Krüger Antriebstechnik · EXW Hamburg · $1,210/unit", "Shenzhen Brightway · FOB Shenzhen · $868/unit", "Anadolu Endüstri · CFR Port Said · $985/unit"], ms: 1200 },
          { label: "Normalizing Incoterms to delivered cost", logs: ["Adding freight, insurance and transit time per lane"], ms: 1100 },
          { label: "Scoring supplier history", logs: ["On-time rates: 96% · 86% · 93%", "Brightway has an open document discrepancy (IMP-2026-048)"], ms: 1000 },
        ],
      },
      {
        agent: "financial",
        task: "Evaluating total cost of ownership",
        steps: [
          { label: "Modelling landed cost per unit", logs: ["Including working-capital cost of longer lead times"], ms: 1000 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "compliance",
    command: "Check compliance for IMP-2026-048 products",
    description: "Trade Compliance reviews HS classification and certificates.",
    result: "compliance",
    phases: [
      orchestrate("Compliance review for IMP-2026-048", "Trade Compliance agent"),
      {
        agent: "compliance",
        task: "Reviewing product and document data",
        steps: [
          { label: "Reading product descriptions", logs: ["Invoice: “Industrial PLC control modules, programmable”", "Declared HS code: 8537.10"], ms: 1100 },
          { label: "Checking classification consistency", logs: ["Description may also fit heading 8538 (parts) — flag for review"], ms: 1200 },
          { label: "Checking required certificates", logs: ["ACID / CargoX reference: present on invoice, absent on packing list", "Conformity certificate: not attached"], ms: 1200 },
        ],
      },
      consolidate,
    ],
  },
  {
    id: "export",
    command: "Find potential buyers in Germany",
    description: "Export Growth compares markets and drafts buyer outreach.",
    result: "export",
    phases: [
      orchestrate("Find export buyers for furniture", "Export Growth agent"),
      {
        agent: "export",
        task: "Researching furniture export markets",
        steps: [
          { label: "Comparing Germany, UAE and Saudi Arabia", logs: ["Scoring demand, price point, logistics and competition", "Using illustrative demo market data"], ms: 1300 },
          { label: "Matching buyer profiles", logs: ["3 demo buyer profiles matched in Germany"], ms: 1100 },
          { label: "Drafting outreach", logs: ["Personalizing email for contract-furniture distributors"], ms: 1000 },
        ],
      },
      consolidate,
    ],
  },
];

export const workflowById = (id: string) => workflows.find((w) => w.id === id);

/* ------------------------------------------------------------------ */
/* Result data                                                        */
/* ------------------------------------------------------------------ */

export const quotations = [
  { supplier: "Krüger Antriebstechnik GmbH", country: "Germany", incoterm: "EXW Hamburg", unit: 1210, delivered: 1318, lead: 21, onTime: 96, warranty: "36 months", score: 78 },
  { supplier: "Shenzhen Brightway Electronics", country: "China", incoterm: "FOB Shenzhen", unit: 868, delivered: 1012, lead: 42, onTime: 86, warranty: "12 months", score: 71 },
  { supplier: "Anadolu Endüstri Makina A.Ş.", country: "Türkiye", incoterm: "CFR Port Said", unit: 985, delivered: 1046, lead: 14, onTime: 93, warranty: "24 months", score: 89 },
];

export const exportMarkets = [
  { market: "Germany", demand: 82, price: 88, logistics: 64, competition: 52, overall: 74, note: "Strong contract-furniture demand; higher compliance bar" },
  { market: "UAE", demand: 76, price: 70, logistics: 86, competition: 61, overall: 73, note: "Fast transit from Damietta; hospitality pipeline" },
  { market: "Saudi Arabia", demand: 88, price: 72, logistics: 80, competition: 58, overall: 77, note: "Large residential projects; existing buyer relationship" },
];

export const demoBuyers = [
  { name: "Nordlicht Objektmöbel GmbH", city: "Cologne", segment: "Office & contract furniture", size: "≈ 120 employees", fit: 91 },
  { name: "Elbe Wohnkonzepte KG", city: "Hamburg", segment: "Hospitality fit-out", size: "≈ 60 employees", fit: 86 },
  { name: "Bayern Interior Supply AG", city: "Munich", segment: "Furniture wholesale", size: "≈ 240 employees", fit: 82 },
];

export const delayRisks = [
  { id: "IMP-2026-032", title: "Terminal free time ends 26 Nov", detail: "Alexandria · clearance not yet filed", exposure: "≈ $1,150/day demurrage", severity: "high" as const, action: "File customs declaration today and pre-book inspection" },
  { id: "IMP-2026-048", title: "Document correction needed before arrival", detail: "Ain Sokhna · ETA 2 Dec", exposure: "Potential customs hold", severity: "high" as const, action: "Request corrected packing list from supplier by 28 Nov" },
  { id: "IMP-2026-040", title: "Inspection appointment not booked", detail: "Alexandria · arrived 20 Nov", exposure: "2–3 day slip", severity: "medium" as const, action: "Ask broker to schedule inspection for 25 Nov" },
];

export const complianceChecklist = [
  { item: "Commercial invoice present", state: "ok" as const },
  { item: "Packing list matches invoice quantities", state: "flag" as const, note: "850 vs 800 units" },
  { item: "ACID / CargoX reference on all documents", state: "flag" as const, note: "Missing on packing list" },
  { item: "HS classification consistent with description", state: "review" as const, note: "8537.10 vs 8538 — professional verification" },
  { item: "Certificate of origin", state: "ok" as const },
  { item: "Product conformity certificate", state: "review" as const, note: "Confirm whether required for this product" },
];
