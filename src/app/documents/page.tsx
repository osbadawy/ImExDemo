import { DocumentsView } from "./view";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const v = sp.shipment;
  return <DocumentsView shipmentId={typeof v === "string" ? v : undefined} />;
}
