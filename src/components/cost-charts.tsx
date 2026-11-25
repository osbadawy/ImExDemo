"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { usd } from "@/lib/format";

export const costColors = ["#4f5bd5", "#2f80c8", "#8fa0e8", "#12a594", "#5fc7b8", "#c27c0e", "#b4b5bb"];

export function CostDonut({ data }: { data: { label: string; usd: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="usd" nameKey="label" innerRadius="64%" outerRadius="92%" paddingAngle={1.5} stroke="none" animationDuration={900}>
          {data.map((_, i) => (
            <Cell key={i} fill={costColors[i % costColors.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
                <div className="font-medium text-ink">{payload[0].name}</div>
                <div className="text-ink-2 tabular">{usd(Number(payload[0].value))}</div>
              </div>
            ) : null
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FxSensitivity({ data, current }: { data: { fx: number; margin: number }[]; current: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <XAxis dataKey="fx" tick={{ fontSize: 11, fill: "#82848d" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#82848d" }} axisLine={false} tickLine={false} unit="%" />
        <ReferenceLine y={0} stroke="#dddad3" />
        <Tooltip
          cursor={{ fill: "rgba(28,29,33,0.03)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
                <div className="font-medium text-ink">USD/EGP {payload[0].payload.fx}</div>
                <div className="text-ink-2 tabular">Est. gross margin {Number(payload[0].value).toFixed(1)}%</div>
              </div>
            ) : null
          }
        />
        <Bar dataKey="margin" radius={[4, 4, 0, 0]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.fx} fill={Math.abs(d.fx - current) < 0.26 ? "#4f5bd5" : d.margin < 12 ? "#e9c58d" : "#c9cef5"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
