import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD_RESET_URL = "https://timsweeny.com/auth/reset-password";

type ResetPasswordRequest = {
  email?: string;
};

export async function POST(request: Request) {
  const { email } = (await request.json()) as ResetPasswordRequest;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Enter your email first." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "implicit",
      persistSession: false
    }
  });

  const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL ?? DEFAULT_PASSWORD_RESET_URL;
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, redirectTo });
}
