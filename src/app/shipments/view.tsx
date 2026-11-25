"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { useMemo, useState } from "react";
import { ShipmentTable } from "@/components/shipment-table";
import { Card, PageHeader } from "@/components/ui";
import { partnerName, shipments } from "@/data";
import { cn, usdCompact } from "@/lib/format";

const filters = [
  { id: "all", label: "All" },
  { id: "attention", label: "Needs attention" },
  { id: "In Transit", label: "In transit" },
  { id: "At Port", label: "At port" },
  { id: "Customs Clearance", label: "Customs" },
  { id: "Booked", label: "Booked" },
  { id: "export", label: "Exports" },
];

export function ShipmentsView({ initialFilter }: { initialFilter?: string }) {
  const [filter, setFilter] = useState(initialFilter ?? "all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    filters.forEach((f) => (c[f.id] = shipments.filter((s) => match(s, f.id)).length));
    return c;
  }, []);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return shipments
      .filter((s) => match(s, filter))
      .filter((s) =>
        !t ||
        [s.id, s.product, s.origin, s.destination, partnerName(s.partnerId), s.category, s.status].join(" ").toLowerCase().includes(t)
      );
  }, [filter, q]);

  const totalValue = rows.reduce((a, s) => a + s.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Shipments" subtitle="Every active import and export across Nile Industrial Trading." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Active shipments", "24"],
          ["Imports · Exports", "18 · 6"],
          ["Arriving in 14 days", "8"],
          ["Needs attention", "5"],
        ].map(([l, v], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card px-5 py-4">
            <div className="text-[13px] text-ink-3">{l}</div>
            <div className={cn("mt-1 text-[22px] font-semibold tracking-tight tabular", l === "Needs attention" && "text-rose")}>{v}</div>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "relative flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] whitespace-nowrap transition-colors cursor-pointer",
                  filter === f.id ? "text-ink font-medium" : "text-ink-3 hover:text-ink"
                )}
              >
                {filter === f.id && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-lg bg-canvas border border-line" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative">{f.label}</span>
                <span className={cn("relative text-[11px] tabular", f.id === "attention" ? "text-rose" : "text-ink-4")}>{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <div className="relative lg:w-[300px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by ID, supplier, port, product…"
              className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-8 text-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 cursor-pointer">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <ShipmentTable rows={rows} showProgress />
        {rows.length === 0 && <div className="px-5 py-14 text-center text-sm text-ink-3">No shipments match your filters.</div>}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink-3">
          <span>
            Showing {rows.length} of {shipments.length} shipments
          </span>
          <span className="tabular">Total value {usdCompact(totalValue)}</span>
        </div>
      </Card>
    </div>
  );
}

function match(s: (typeof shipments)[number], f: string) {
  if (f === "all") return true;
  if (f === "attention") return s.risk !== "low";
  if (f === "export") return s.direction === "export";
  return s.status === f;
}
