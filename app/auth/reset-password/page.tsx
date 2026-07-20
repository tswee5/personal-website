"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetShell message="Preparing password reset..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Choose a new password.");
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function prepareSession() {
      const supabase = createClient();
      const errorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const hashErrorDescription = params.get("error_description");

      if (errorDescription || hashErrorDescription) {
        setMessage(errorDescription ?? hashErrorDescription ?? "The password reset link could not be used.");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage(error.message);
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
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

        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMessage("No password reset session was found. Request a fresh reset link from /admin.");
        return;
      }

      setIsReady(true);
    }

    prepareSession();
  }, [searchParams]);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setIsSaving(true);
    setMessage("Updating password...");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. Taking you back to admin...");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <ResetShell message={message}>
      {isReady ? (
        <form className="mt-6 space-y-3" onSubmit={updatePassword}>
          <label className="flex min-h-12 items-center gap-3 border border-rule px-3">
            <KeyRound size={17} className="text-muted" />
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="New password"
            />
          </label>
          <label className="flex min-h-12 items-center gap-3 border border-rule px-3">
            <KeyRound size={17} className="text-muted" />
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Confirm password"
            />
          </label>
          <button disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-paper disabled:opacity-50">
            <KeyRound size={16} />
            {isSaving ? "Updating" : "Update password"}
          </button>
        </form>
      ) : null}
    </ResetShell>
  );
}

function ResetShell({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 pt-16 sm:px-6 lg:px-8">
      <section className="border border-rule bg-paper p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Password reset</p>
        <h1 className="mt-2 font-serif text-3xl font-normal">Reset admin password</h1>
        <p className="mt-3 text-muted">{message}</p>
        {children}
      </section>
    </main>
  );
}
