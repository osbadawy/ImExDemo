"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone?: "success" | "info";
}

const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex gap-3 rounded-xl border border-line bg-white p-3.5 shadow-pop"
            >
              {t.tone === "info" ? (
                <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[13px] text-ink-3">{t.body}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
