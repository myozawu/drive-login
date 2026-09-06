import * as store from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");

  if (!pin || !(await store.has(pin.toLocaleLowerCase()))) {
    return NextResponse.json("Invalid PIN", {
      status: 401,
    });
  }

  return NextResponse.json("data", {
    status: 201,
  });
}
