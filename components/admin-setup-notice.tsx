export function AdminSetupNotice() {
  return (
    <section className="max-w-2xl border border-rule bg-paper p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Supabase required</p>
      <h2 className="mt-2 font-serif text-3xl font-normal">Connect Supabase to enable admin writes</h2>
      <p className="mt-3 text-muted">
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then run the SQL in `supabase/schema.sql`.
      </p>
    </section>
  );
}
