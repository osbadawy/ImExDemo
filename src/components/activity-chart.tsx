"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { activitySeries } from "@/data";

function Tip({ active, payload, label }: { active?: boolean; payload?: { payload: (typeof activitySeries)[number] }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <div className="mb-1 font-medium text-ink">
        Week of {label} {p.forecast && <span className="text-ink-3">· forecast</span>}
      </div>
      <div className="flex items-center gap-2 text-ink-2">
        <span className="size-2 rounded-full bg-brand" /> {p.arrivals} incoming shipments
      </div>
      <div className="flex items-center gap-2 text-ink-2">
        <span className="size-2 rounded-full bg-mint" /> {p.departures} outgoing shipments
      </div>
      <div className="mt-1 text-ink-3">${p.value.toFixed(2)}M import value</div>
    </div>
  );
}

export default function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activitySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f5bd5" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#4f5bd5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12a594" stopOpacity={0.14} />
            <stop offset="100%" stopColor="#12a594" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ebe9e4" strokeDasharray="0" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#82848d" }} axisLine={false} tickLine={false} interval={1} />
        <YAxis tick={{ fontSize: 11, fill: "#82848d" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<Tip />} cursor={{ stroke: "#dddad3", strokeDasharray: "3 3" }} />
        <Area type="monotone" dataKey="departures" stroke="#12a594" strokeWidth={1.8} fill="url(#gOut)" animationDuration={1400} />
        <Area type="monotone" dataKey="arrivals" stroke="#4f5bd5" strokeWidth={2} fill="url(#gIn)" animationDuration={1400} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
