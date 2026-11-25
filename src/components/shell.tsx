"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bot,
  Calculator,
  ChevronsLeft,
  FileText,
  LayoutGrid,
  Menu,
  Search,
  Settings,
  Ship,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { company, notifications, partnerName, shipments } from "@/data";
import { cn } from "@/lib/format";
import { StatusPill } from "./ui";

const nav = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/shipments", label: "Shipments", icon: Ship },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/costs", label: "Cost Intelligence", icon: Calculator },
  { href: "/workspace", label: "AI Workspace", icon: Bot, badge: "6" },
];

const titles: [string, string][] = [
  ["/shipments/", "Shipment detail"],
  ["/shipments", "Shipments"],
  ["/documents", "Document Intelligence"],
  ["/costs", "Cost Intelligence"],
  ["/workspace", "AI Workspace"],
  ["/settings", "Settings"],
];

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1">
      <div className="relative grid size-8 shrink-0 place-items-center rounded-[10px] bg-ink shadow-sm">
        <svg viewBox="0 0 24 24" className="size-[18px]">
          <path d="M4 15.5c3.2 0 4.4-7 8-7s4.8 7 8 7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="15.5" r="1.8" fill="#7d89f0" />
        </svg>
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight text-ink">TradeFlow AI</div>
          <div className="text-[11px] text-ink-3">{company.name}</div>
        </div>
      )}
    </Link>
  );
}

function Sidebar({ collapsed, setCollapsed, onNavigate }: { collapsed: boolean; setCollapsed?: (v: boolean) => void; onNavigate?: () => void }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "justify-between px-4")}>
        <Logo collapsed={collapsed} />
      </div>
      <nav className={cn("mt-2 flex flex-col gap-0.5", collapsed ? "px-2.5" : "px-3")}>
        {!collapsed && <div className="px-2.5 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-4">Workspace</div>}
        {nav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onNavigate}
              title={collapsed ? n.label : undefined}
              className={cn(
                "group relative flex h-9 items-center gap-2.5 rounded-lg text-[14px] transition-colors",
                collapsed ? "justify-center" : "px-2.5",
                active ? "text-ink font-medium" : "text-ink-2 hover:bg-ink/[0.035] hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg border border-line bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <n.icon className={cn("relative size-[17px] shrink-0", active ? "text-brand" : "text-ink-3 group-hover:text-ink-2")} strokeWidth={1.8} />
              {!collapsed && <span className="relative flex-1">{n.label}</span>}
              {!collapsed && n.badge && (
                <span className="relative flex items-center gap-1 rounded-md bg-mint-50 px-1.5 py-0.5 text-[11px] font-medium text-mint">
                  <span className="size-1.5 rounded-full bg-mint" />
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 px-3 pb-4">
        <Link
          href="/settings"
          onClick={onNavigate}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-lg text-[14px] text-ink-2 hover:bg-ink/[0.035] hover:text-ink",
            collapsed ? "justify-center" : "px-2.5",
            path === "/settings" && "bg-white border border-line text-ink"
          )}
        >
          <Settings className="size-[17px] text-ink-3" strokeWidth={1.8} />
          {!collapsed && "Settings"}
        </Link>
        {!collapsed && (
          <div className="mt-3 rounded-xl border border-line bg-white p-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <span className="size-1.5 rounded-full bg-mint" />
              AI agents online
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">6 agents monitoring 24 shipments across 9 ports.</p>
          </div>
        )}
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "mt-2 flex h-8 items-center gap-2 rounded-lg text-xs text-ink-3 hover:bg-ink/[0.035] hover:text-ink-2 cursor-pointer",
              collapsed ? "justify-center" : "px-2.5"
            )}
          >
            <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return shipments.slice(0, 5);
    return shipments
      .filter((s) =>
        [s.id, s.product, s.origin, s.destination, partnerName(s.partnerId), s.category].join(" ").toLowerCase().includes(t)
      )
      .slice(0, 6);
  }, [q]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    setQ("");
    ref.current?.blur();
    router.push(`/shipments/${id}`);
  };

  return (
    <div className="relative w-full max-w-[380px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        ref={ref}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0].id)}
        placeholder="Search shipments, suppliers, ports…"
        className="h-9 w-full rounded-lg border border-line bg-canvas/70 pl-9 pr-14 text-sm text-ink placeholder:text-ink-3 outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-white px-1.5 text-[10px] font-medium text-ink-3">Ctrl K</kbd>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-4">
              {q ? `${results.length} results` : "Recent shipments"}
            </div>
            {results.length === 0 && <div className="px-2.5 py-3 text-sm text-ink-3">No shipments match “{q}”.</div>}
            {results.map((s) => (
              <button
                key={s.id}
                onMouseDown={() => go(s.id)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-canvas cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{s.id}</div>
                  <div className="truncate text-xs text-ink-3">
                    {s.origin} → {s.destination} · {s.product}
                  </div>
                </div>
                <StatusPill status={s.status} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const router = useRouter();
  const unread = read ? 0 : notifications.filter((n) => n.unread).length;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-ink/[0.04] cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" strokeWidth={1.8} />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-rose ring-2 ring-white" />}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-[340px] rounded-xl border border-line bg-white shadow-pop"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                <button onClick={() => setRead(true)} className="text-xs text-brand hover:underline cursor-pointer">
                  Mark all read
                </button>
              </div>
              <div className="p-1.5">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false);
                      const id = n.body.split(" ")[0];
                      router.push(id.startsWith("IMP") || id.startsWith("EXP") ? `/shipments/${id}` : "/shipments");
                    }}
                    className="flex w-full gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-canvas cursor-pointer"
                  >
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.unread && !read ? "bg-brand" : "bg-transparent")} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-ink">{n.title}</div>
                      <div className="text-xs text-ink-3">{n.body}</div>
                    </div>
                    <span className="text-[11px] text-ink-4 whitespace-nowrap">{n.time}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();
  const title = path === "/" ? "Overview" : titles.find(([p]) => path.startsWith(p))?.[1] ?? "TradeFlow AI";

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("tf-collapsed") === "1");
    } catch {}
  }, []);
  const toggle = (v: boolean) => {
    setCollapsed(v);
    try {
      localStorage.setItem("tf-collapsed", v ? "1" : "0");
    } catch {}
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-line bg-canvas transition-[width] duration-300 ease-out md:block",
          collapsed ? "w-[68px]" : "w-[248px]"
        )}
      >
        <Sidebar collapsed={collapsed} setCollapsed={toggle} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-line bg-canvas md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 text-ink-3">
                <X className="size-5" />
              </button>
              <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="text-ink-2 md:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden min-w-[160px] text-[15px] font-semibold tracking-tight text-ink sm:block">{title}</div>
          <div className="flex flex-1 justify-center">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-amber/25 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber lg:inline-flex">
              <span className="size-1.5 rounded-full bg-amber" />
              Demo environment
            </span>
            <Notifications />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#5b67de] to-[#3a45b0] text-xs font-semibold text-white">
                {company.user.initials}
              </div>
              <div className="hidden leading-tight xl:block">
                <div className="text-[13px] font-medium text-ink">{company.user.name}</div>
                <div className="text-[11px] text-ink-3">{company.name}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[1320px]"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
