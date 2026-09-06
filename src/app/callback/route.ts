import { Token, UserData } from "@/type";
import * as store from "@/lib/store";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = request.nextUrl.origin;

  const [pin, clientId, clientSecret] = (searchParams.get("state") ?? "").split(
    "|"
  );
  const code = searchParams.get("code");
  const scope = searchParams.get("scope") as string;
  const redirect_uri = `${origin}/callback`;

  const googleError = searchParams.get("error");
  if (googleError) {
    return fail(`Google returned "${googleError}". Nothing was saved.`);
  }
  if (!pin || !code) {
    return fail("The sign-in link was missing its PIN or authorization code.");
  }

  const key = pin.toLocaleLowerCase();
  const userData = await store.get<UserData>(key);
  const ttl = await store.ttl(key);

  if (!userData || ttl <= 0) {
    return fail(
      "That PIN already expired. Start over from Kodi to get a new one."
    );
  }

  let token: Token;
  try {
    const response = await axios.post<Token>(
      "https://oauth2.googleapis.com/token",
      {
        client_id: clientId ?? (process.env.GOOGLE_CLIENT_ID as string),
        client_secret:
          clientSecret ?? (process.env.GOOGLE_CLIENT_SECRET as string),
        grant_type: "authorization_code",
        redirect_uri,
        code,
        scope,
      }
    );
    token = response.data;
  } catch (e) {
    // Surface Google's own reason: an opaque 500 here is what makes this step
    // impossible to debug from the Kodi side.
    const detail = axios.isAxiosError(e)
      ? JSON.stringify(e.response?.data ?? e.message)
      : String(e);
    return fail(`Google rejected the token exchange: ${detail}`);
  }

  if (!token?.access_token) {
    return fail("Google returned no access token.");
  }

  await store.set(key, { ...userData, token }, ttl);

  return NextResponse.redirect(`${origin}/success`);
}

function fail(message: string) {
  return new Response(message, {
    status: 400,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
