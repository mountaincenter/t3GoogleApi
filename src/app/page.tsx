import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import GoogleFitPage from "./GoogleFit/page";
import { Button } from "@/components/ui/button";
import GoogleApis from "@/app/GoogleApis/GoogleApis";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <GoogleApis />
              <p className="text-center text-2xl">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                <Button>{session ? "Sign out" : "Sign in"}</Button>
              </Link>
              <GoogleFitPage />
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
