export const usd = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);

export const usdCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return `$${n.toFixed(0)}`;
};

export const egp = (n: number) =>
  `EGP ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;

export const egpCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `EGP ${(n / 1_000).toFixed(0)}K`;
  return `EGP ${n.toFixed(0)}`;
};

export const num = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const date = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const dateLong = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
