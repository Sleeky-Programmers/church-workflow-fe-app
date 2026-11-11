"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { RouteConfig } from "@/config/routes";
import { redeemHandoff } from "@/lib/api";
import { initializeAuthSession } from "@/lib/auth/session";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Arriving from the Service Timer's "Open Church Workflow": the link
 * carries a one-time code in its #fragment (never sent to a server), which
 * is traded for the user's own session, as if they had signed in here.
 */
export default function HandoffPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // The code works once: don't spend it twice (React dev double effects).
    if (started.current) return;
    started.current = true;

    const code = new URLSearchParams(window.location.hash.slice(1)).get("code");
    // Drop the code from the address bar and history.
    window.history.replaceState(null, "", window.location.pathname);
    if (!code) {
      setFailed(true);
      return;
    }

    redeemHandoff(code)
      .then((data) => {
        const profile = initializeAuthSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
        setUser({
          id: profile.id || profile.userKey,
          name: profile.fullName || profile.firstName || "Super Admin",
          email: profile.email || "",
        });
        router.replace(
          data.user?.churchId
            ? RouteConfig.dashboard.home
            : RouteConfig.onboarding,
        );
      })
      .catch(() => setFailed(true));
  }, [router, setUser]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      {failed ? (
        <div className="w-full max-w-sm rounded-xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">This link has expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign-in links from the Service Timer work once, for a minute. Sign
            in with the same email and password you use for the timer.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href={RouteConfig.auth.signIn}>Sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4" role="status">
          <Loader />
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
      )}
    </main>
  );
}
