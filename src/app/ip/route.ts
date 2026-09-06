import { getIp } from "@/lib/get-ip";
import { NextRequest } from "next/server";

// Without this the route is statically prerendered and every caller gets the
// same build-time value instead of their own address.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return new Response(getIp() ?? req.ip ?? "127.0.0.1", {
    status: 200,
  });
}
