"use client";

import { Building2, Bell, KeyRound, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast";
import { Card, PageHeader } from "@/components/ui";
import { company } from "@/data";
import { cn } from "@/lib/format";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={cn("relative h-5 w-9 rounded-full transition-colors cursor-pointer", on ? "bg-brand" : "bg-line-strong")}>
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState({ digest: true, alerts: true, approvals: true, autoDraft: false });
  const row = (k: keyof typeof prefs, title: string, body: string) => (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <div className="text-[14px] font-medium">{title}</div>
        <div className="text-[13px] text-ink-3">{body}</div>
      </div>
      <Toggle
        on={prefs[k]}
        onChange={(v) => {
          setPrefs((p) => ({ ...p, [k]: v }));
          toast({ title: "Preference updated", body: "Demo only — not persisted", tone: "info" });
        }}
      />
    </div>
  );
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Workspace preferences (visual placeholder in this demo)." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          [Building2, "Company", company.name],
          [Users, "Team", "8 members"],
          [Bell, "Notifications", "Email & in-app"],
          [KeyRound, "Integrations", "Not connected (demo)"],
        ].map(([Icon, t, v]) => {
          const I = Icon as typeof Building2;
          return (
            <Card key={t as string} className="p-5">
              <I className="size-4 text-ink-3" />
              <div className="mt-3 text-[13px] text-ink-3">{t as string}</div>
              <div className="text-[14px] font-medium">{v as string}</div>
            </Card>
          );
        })}
      </div>
      <Card className="divide-y divide-line">
        {row("digest", "Daily operations digest", "Morning summary of shipments and AI insights")}
        {row("alerts", "Deadline alerts", "Notify when free time or document deadlines approach")}
        {row("approvals", "Require human approval", "AI-drafted emails must be approved before sending")}
        {row("autoDraft", "Auto-draft supplier corrections", "Draft correction emails as soon as discrepancies are found")}
      </Card>
    </div>
  );
}
