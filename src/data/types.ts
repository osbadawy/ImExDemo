export type ShipmentStatus =
  | "Booked"
  | "In Transit"
  | "At Port"
  | "Customs Clearance"
  | "Action Required"
  | "Delivered";

export type RiskLevel = "low" | "medium" | "high";
export type Direction = "import" | "export";
export type DocStatus = "verified" | "in-review" | "issue" | "missing";

export interface Supplier {
  id: string;
  name: string;
  country: string;
  city: string;
  category: string;
  rating: number; // 0-5
  onTimeRate: number; // %
  avgLeadDays: number;
  shipmentsYtd: number;
}

export interface Buyer {
  id: string;
  name: string;
  country: string;
  city: string;
  segment: string;
  annualVolume: string;
}

export interface ShipmentDocument {
  name: string;
  type: string;
  status: DocStatus;
  pages: number;
  size: string;
  uploaded: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  detail: string;
  done: boolean;
}

export interface Shipment {
  id: string;
  direction: Direction;
  partnerId: string; // supplier (import) or buyer (export)
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  product: string;
  category: string;
  value: number; // USD
  quantity: number;
  unit: string;
  incoterm: string;
  mode: string;
  container: string;
  carrier: string;
  departure: string;
  eta: string;
  status: ShipmentStatus;
  stage: number; // 0..5
  risk: RiskLevel;
  riskNote?: string;
  freight: number; // USD
  portFeesEgp: number;
  otherEgp: number;
  dutyRate: number; // hypothetical, %
}

export interface Insight {
  id: string;
  kind: "document" | "deadline" | "freight";
  title: string;
  body: string;
  shipmentId: string;
  impact: string;
  severity: RiskLevel;
  href: string;
  cta: string;
}
