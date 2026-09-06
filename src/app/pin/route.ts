import { getIp } from "@/lib/get-ip";
import { PIN_TTL_SECONDS } from "@/lib/config";
import * as store from "@/lib/store";
import {
  encodeCredentials,
  formDataToJson,
  generatePassword,
  generatePin,
} from "@/utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const { provider } = formDataToJson(body);

  const owner = getIp() ?? "127.0.0.1";

  const password = generatePassword(128);

  let pin = "";
  do {
    pin = generatePin();
  } while (await store.has(pin));

  const data = {
    pin,
    password: encodeCredentials(owner, password),
    provider,
    owner,
  };

  await store.set(pin, data, PIN_TTL_SECONDS);

  return Response.json(data);
}
