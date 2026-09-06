import { PIN_TTL_SECONDS } from "@/lib/config";
import * as store from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Says whether a shared store is actually wired up. Reports the *names* of the
 * store-related variables the platform injected — never their values — so a
 * misnamed binding can be spotted without reading the environment by hand.
 */
export async function GET() {
  const seen = Object.keys(process.env)
    .filter((k) => /REDIS|^KV_|UPSTASH/i.test(k))
    .sort();

  return Response.json({
    store: store.isShared ? "redis" : "memory",
    pinTtlSeconds: PIN_TTL_SECONDS,
    storeEnvNames: seen,
  });
}
