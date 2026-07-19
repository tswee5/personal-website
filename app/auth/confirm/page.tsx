"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<AuthMessage message="Completing sign in..." />}>
      <AuthConfirmContent />
    </Suspense>
  );
}

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    async function completeSignIn() {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/admin";
      const code = searchParams.get("code");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage(error.message);
          return;
        }

        router.replace(next);
        router.refresh();
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.replace(next);
        router.refresh();
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setMessage("No sign-in token was found. Send a fresh magic link from /admin and open it in this browser.");
    }

    completeSignIn();
  }, [router, searchParams]);

  return (
    <AuthMessage message={message} />
  );
}

function AuthMessage({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-xl px-4 pt-16 sm:px-6 lg:px-8">
      <section className="border border-rule bg-paper p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Authentication</p>
        <h1 className="mt-2 font-serif text-3xl font-normal">{message}</h1>
      </section>
    </main>
  );
}
