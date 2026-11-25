"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { partnerName } from "@/data";
import type { Shipment } from "@/data/types";
import { cn, date, usd } from "@/lib/format";
import { RiskIndicator, StageProgress, StatusPill } from "./ui";

export function ShipmentTable({ rows, showProgress = false, dense = false }: { rows: Shipment[]; showProgress?: boolean; dense?: boolean }) {
  const router = useRouter();
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-y border-line bg-canvas/50 text-[11.5px] font-medium uppercase tracking-wider text-ink-3">
            <th className="py-2.5 pl-5 pr-3 font-medium">Shipment</th>
            <th className="px-3 py-2.5 font-medium">Route</th>
            <th className="px-3 py-2.5 font-medium">Partner</th>
            <th className="px-3 py-2.5 text-right font-medium">Value</th>
            <th className="px-3 py-2.5 font-medium">ETA</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            {showProgress && <th className="px-3 py-2.5 font-medium">Progress</th>}
            <th className="px-3 py-2.5 font-medium">AI risk</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <motion.tr
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
              onClick={() => router.push(`/shipments/${s.id}`)}
              className="group cursor-pointer border-b border-line/70 last:border-0 transition-colors hover:bg-canvas/70"
            >
              <td className={cn("pl-5 pr-3", dense ? "py-3" : "py-3.5")}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-lg",
                      s.direction === "import" ? "bg-brand-50 text-brand" : "bg-mint-50 text-mint"
                    )}
                  >
                    {s.direction === "import" ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-medium text-ink tabular">{s.id}</div>
                    <div className="max-w-[190px] truncate text-xs text-ink-3">{s.product}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 text-[13px] text-ink-2 whitespace-nowrap">
                {s.origin} <span className="text-ink-4">→</span> {s.destination}
              </td>
              <td className="max-w-[200px] truncate px-3 text-[13px] text-ink-2">{partnerName(s.partnerId)}</td>
              <td className="px-3 text-right text-[13.5px] font-medium text-ink tabular">{usd(s.value)}</td>
              <td className="px-3 text-[13px] text-ink-2 tabular whitespace-nowrap">{date(s.eta)}</td>
              <td className="px-3">
                <StatusPill status={s.status} />
              </td>
              {showProgress && (
                <td className="px-3">
                  <StageProgress stage={s.stage} compact warn={s.risk === "high"} />
                </td>
              )}
              <td className="px-3">
                <RiskIndicator risk={s.risk} />
              </td>
              <td className="pr-4">
                <ChevronRight className="size-4 text-ink-4 transition group-hover:translate-x-0.5 group-hover:text-ink-2" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
