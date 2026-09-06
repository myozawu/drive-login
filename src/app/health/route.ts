import { PIN_TTL_SECONDS } from "@/lib/config";
import * as store from "@/lib/store";

export const dynamic = "force-dynamic";

/** Says whether a shared store is actually wired up, without exposing it. */
export async function GET() {
  return Response.json({
    store: store.isShared ? "redis" : "memory",
    pinTtlSeconds: PIN_TTL_SECONDS,
  });
}
