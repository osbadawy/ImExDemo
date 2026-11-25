import { CostView } from "./view";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const v = sp.shipment;
  return <CostView shipmentId={typeof v === "string" ? v : undefined} />;
}
