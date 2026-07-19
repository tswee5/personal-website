import { NextResponse } from "next/server";
import { buildPayload, type AdminTable, type EditableAdminRow } from "@/lib/admin-payloads";
import { createAdminClient, hasLocalAdminBypass } from "@/lib/supabase/admin";

type SaveRequest = {
  action: "save";
  table: AdminTable;
  draft: EditableAdminRow;
  selectedId: string;
  isNew: boolean;
  publish: boolean;
};

type DeleteRequest = {
  action: "delete";
  table: AdminTable;
  selectedId: string;
};

export async function POST(request: Request) {
  if (!hasLocalAdminBypass()) {
    return NextResponse.json({ error: "Local admin bypass is not enabled." }, { status: 403 });
  }

  const body = (await request.json()) as SaveRequest | DeleteRequest;
  const supabase = createAdminClient();

  if (body.action === "delete") {
    const { error } = await deleteRow(supabase, body.table, body.selectedId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  }

  const payload = buildPayload(body.table, body.draft, body.publish);
  const now = new Date().toISOString();
  const { data, error } = await saveRow(supabase, body.table, payload, body.selectedId, body.isNew, now);

  if (error) {
    return NextResponse.json({ error: formatAdminError(error.message) }, { status: 400 });
  }

  return NextResponse.json({ saved: data });
}

function formatAdminError(message: string) {
  const missingTriageColumn =
    message.includes("read_depth") ||
    message.includes("triage_status") ||
    message.includes("reading_priority") ||
    message.includes("reading_intent") ||
    message.includes("decision") ||
    message.includes("progress_current") ||
    message.includes("progress_total") ||
    message.includes("progress_unit") ||
    message.includes("completed_at");

  if (missingTriageColumn) {
    return `${message}. Run supabase/status_dates_upgrade.sql, supabase/reading_progress_upgrade.sql, and supabase/reading_triage_upgrade.sql in the Supabase SQL Editor, then save again.`;
  }

  if (message.includes("top_of_mind")) {
    return `${message}. Run supabase/top_of_mind_upgrade.sql in the Supabase SQL Editor, then save again.`;
  }

  if (message.includes("about_page")) {
    return `${message}. Run supabase/about_page_upgrade.sql in the Supabase SQL Editor, then save again.`;
  }

  return message;
}

function saveRow(
  supabase: ReturnType<typeof createAdminClient>,
  table: AdminTable,
  payload: ReturnType<typeof buildPayload>,
  selectedId: string,
  isNew: boolean,
  now: string
) {
  if (table === "writing") {
    return isNew
      ? supabase.from("writing").insert(payload as never).select("*").single()
      : supabase.from("writing").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  }

  if (table === "reading") {
    return isNew
      ? supabase.from("reading").insert(payload as never).select("*").single()
      : supabase.from("reading").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  }

  if (table === "projects") {
    return isNew
      ? supabase.from("projects").insert(payload as never).select("*").single()
      : supabase.from("projects").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  }

  if (table === "top_of_mind") {
    return isNew
      ? supabase.from("top_of_mind").insert(payload as never).select("*").single()
      : supabase.from("top_of_mind").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  }

  if (table === "about_page") {
    return isNew
      ? supabase.from("about_page").insert(payload as never).select("*").single()
      : supabase.from("about_page").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  }

  return isNew
    ? supabase.from("interests").insert(payload as never).select("*").single()
    : supabase.from("interests").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
}

function deleteRow(supabase: ReturnType<typeof createAdminClient>, table: AdminTable, selectedId: string) {
  if (table === "writing") {
    return supabase.from("writing").delete().eq("id", selectedId);
  }

  if (table === "reading") {
    return supabase.from("reading").delete().eq("id", selectedId);
  }

  if (table === "projects") {
    return supabase.from("projects").delete().eq("id", selectedId);
  }

  if (table === "top_of_mind") {
    return supabase.from("top_of_mind").delete().eq("id", selectedId);
  }

  if (table === "about_page") {
    return supabase.from("about_page").delete().eq("id", selectedId);
  }

  return supabase.from("interests").delete().eq("id", selectedId);
}
