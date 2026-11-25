import { ShipmentsView } from "./view";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const v = sp.filter;
  return <ShipmentsView initialFilter={typeof v === "string" ? v : undefined} />;
}
