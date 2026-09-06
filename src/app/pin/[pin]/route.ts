import { UserData } from "@/type";
import * as store from "@/lib/store";
import { decodeCredentials } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params: { pin } }: { params: { pin: string } }
) {
  const key = pin.toLocaleLowerCase();
  const userData = await store.get<UserData>(key);

  if (!userData) {
    return NextResponse.json("Message: Token Expired", {
      status: 404,
    });
  }

  const auth = req.headers.get("authorization");

  if (!auth) {
    return Response.json("", {
      status: 404,
    });
  }

  const [, authBasis] = auth.split(" ");
  const { password } = decodeCredentials(authBasis);

  if (userData.password !== password) {
    return Response.json("", {
      status: 403,
    });
  }

  if (!userData.token) {
    return Response.json(null);
  }

  await store.del(key);
  return NextResponse.json(userData.token);
}
