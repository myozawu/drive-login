import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as store from "@/lib/store";
import { getGoogleAuthUrl } from "@/utils/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Target of the QR code Kodi shows next to the PIN. Scanning it skips typing
 * the address and the PIN by hand and goes straight to Google.
 */
export default async function SignInWithPin({
  params: { pin },
}: {
  params: { pin: string };
}) {
  const key = decodeURIComponent(pin).toLocaleLowerCase();

  if (await store.has(key)) {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";

    // redirect() throws, so it must stay outside any try/catch.
    redirect(await getGoogleAuthUrl(key, `${proto}://${host}/callback`));
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-24">
      <Card className="w-full max-w-md bg-muted/50 shadow-xl border-none rounded-md p-6">
        <CardHeader>
          <CardTitle className="text-center relative">
            <span className="text-[#353132] font-bold text-3xl tracking-tighter leading-none pr-2">
              PIN not found
            </span>
          </CardTitle>
          <CardDescription>
            The PIN <span className="font-mono font-bold">{key}</span> has
            expired or was never issued. Choose Add account in Kodi again to get
            a fresh one.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8"></CardContent>
        <CardFooter>
          <Link href={"/"} className={buttonVariants({ variant: "link" })}>
            Enter a PIN manually
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
