"use client";

import { useState } from "react";
import { KeyRound, Mail, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/admin`
      }
    });

    setIsSending(false);
    setStatus(error ? error.message : "Check your email for the login link.");
  }

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsSending(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.reload();
  }

  return (
    <section className="max-w-xl border border-rule bg-paper p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Admin login</p>
      <h2 className="mt-2 font-serif text-3xl font-normal">Email magic link</h2>
      <p className="mt-3 text-muted">Sign in with the email attached to your Supabase owner profile.</p>
      <form className="mt-6 space-y-3" onSubmit={sendMagicLink}>
        <label className="flex min-h-12 items-center gap-3 border border-rule px-3">
          <Mail size={17} className="text-muted" />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="you@example.com"
          />
        </label>
        <button disabled={isSending} className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-paper disabled:opacity-50">
          <Send size={16} />
          {isSending ? "Sending" : "Send login link"}
        </button>
      </form>
      <div className="my-6 border-t border-rule" />
      <form className="space-y-3" onSubmit={signInWithPassword}>
        <label className="flex min-h-12 items-center gap-3 border border-rule px-3">
          <KeyRound size={17} className="text-muted" />
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Password"
          />
        </label>
        <button disabled={isSending} className="inline-flex min-h-11 items-center gap-2 border border-ink px-4 disabled:opacity-50">
          <KeyRound size={16} />
          {isSending ? "Signing in" : "Sign in with password"}
        </button>
      </form>
      {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}
    </section>
  );
}
