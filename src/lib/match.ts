import { workflows } from "@/data/agents";

/** Lightweight keyword router for the demo command bar (no NLU). */
export function matchWorkflow(text: string): string {
  const t = text.toLowerCase();
  const exact = workflows.find((w) => w.command.toLowerCase() === t);
  if (exact) return exact.id;
  if (/048|review shipment/.test(t)) return "review-048";
  if (/document|invoice|packing|discrep/.test(t)) return "documents";
  if (/cost|expens|landed|margin|price|fx/.test(t)) return "expensive-imports";
  if (/delay|risk|late|deadline|demurrage/.test(t)) return "delays";
  if (/supplier|quot|procure|vendor/.test(t)) return "suppliers";
  if (/complian|hs |hs$|classif|certif|acid/.test(t)) return "compliance";
  if (/buyer|export|market|germany|outreach/.test(t)) return "export";
  return "review-048";
}
