import { WorkspaceView } from "./view";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const v = sp.task;
  return <WorkspaceView task={typeof v === "string" ? v : undefined} />;
}
