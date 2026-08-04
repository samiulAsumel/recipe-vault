import type { Env } from "../types";
import type { VisitCounter } from "../VisitCounter";

export type { PageKind, VisitInput, DailyCount, TopEntry, AnalyticsSummary } from "../VisitCounter";

// Single global instance: this site's traffic is small enough that one
// Durable Object handles all writes, and a fixed name keeps every request
// routing to the same instance without any lookup table.
export function getVisitCounter(env: Env): DurableObjectStub<VisitCounter> {
  return env.VISITS.get(env.VISITS.idFromName("global"));
}
