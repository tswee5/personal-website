import { AdminConsole } from "@/components/admin-console";
import { AdminLogin } from "@/components/admin-login";
import { AdminSetupNotice } from "@/components/admin-setup-notice";
import type { AdminData } from "@/lib/admin-types";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

async function getAdminData(): Promise<AdminData> {
  const supabase = await createClient();
  const [writingResult, readingResult, projectsResult, interestsResult, topOfMindResult, aboutPageResult] = await Promise.all([
    supabase.from("writing").select("*").order("updated_at", { ascending: false }),
    supabase.from("reading").select("*").order("updated_at", { ascending: false }),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("interests").select("*").order("updated_at", { ascending: false }),
    supabase.from("top_of_mind").select("*").order("sort_order", { ascending: true }),
    supabase.from("about_page").select("*").order("updated_at", { ascending: false }).limit(1)
  ]);

  return {
    writing: writingResult.data ?? [],
    reading: readingResult.data ?? [],
    projects: projectsResult.data ?? [],
    interests: interestsResult.data ?? [],
    topOfMind: topOfMindResult.data ?? [],
    aboutPage: aboutPageResult.data ?? []
  };
}

export default async function AdminPage() {
  const hasConfig = hasSupabaseConfig();
  const supabase = hasConfig ? await createClient() : null;
  const authResult = supabase ? await supabase.auth.getUser() : null;
  const user = authResult?.data.user;
  const profileResult = user ? await supabase?.from("profiles").select("is_owner").eq("id", user.id).single() : null;
  const isOwner = Boolean(profileResult?.data?.is_owner);
  const adminData = user && isOwner ? await getAdminData() : null;

  return (
    <main className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">Admin</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">A quiet operating room for publishing, reading capture, drafts, relationships, and media.</p>
      <div className="mt-12">
        {!hasConfig ? <AdminSetupNotice /> : null}
        {hasConfig && !user ? <AdminLogin /> : null}
        {hasConfig && user && !isOwner ? (
          <section className="max-w-2xl border border-rule bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Access pending</p>
            <h2 className="mt-2 font-serif text-3xl font-normal">Owner access is not enabled for {user.email}</h2>
            <p className="mt-3 text-muted">In Supabase, set this account&apos;s `profiles.is_owner` value to `true`, then refresh this page.</p>
          </section>
        ) : null}
        {hasConfig && user && isOwner && adminData ? <AdminConsole initialData={adminData} user={{ email: user.email ?? "Signed in", isOwner }} /> : null}
      </div>
    </main>
  );
}
