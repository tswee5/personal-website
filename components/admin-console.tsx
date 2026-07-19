"use client";

import { useMemo, useState } from "react";
import { BookOpen, FolderKanban, Image, Lightbulb, LinkIcon, Network, Plus, Save, Send, Sparkles, Trash2, UserRound } from "lucide-react";
import { defaultAboutRow } from "@/lib/about-defaults";
import { buildPayload, slugify, type AdminTable } from "@/lib/admin-payloads";
import type { AboutPageRow, AdminData, AdminUser, InterestRow, ProjectRow, ReadingRow, TopOfMindRow, WritingRow } from "@/lib/admin-types";
import { createClient } from "@/lib/supabase/browser";

type TabId = "aboutPage" | "reading" | "projects" | "interests" | "topOfMind" | "drafts" | "media";
type EditableRow = WritingRow | ReadingRow | ProjectRow | InterestRow | TopOfMindRow | AboutPageRow;

const tabs = [
  { id: "aboutPage", label: "About", icon: UserRound },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "interests", label: "Interests", icon: Network },
  { id: "topOfMind", label: "Top of Mind", icon: Lightbulb },
  { id: "drafts", label: "Drafts", icon: Save },
  { id: "media", label: "Media", icon: Image }
] as const;

const emptyWriting: WritingRow = {
  id: "new",
  slug: "",
  type: "Essay",
  title: "",
  subtitle: "",
  body_mdx: "## Draft title\n\nStart with the idea, then sharpen it.",
  reading_time: "",
  published_at: null,
  draft: true,
  created_at: "",
  updated_at: ""
};

const emptyReading: ReadingRow = {
  id: "new",
  slug: "",
  title: "",
  author: "",
  source_url: "",
  source_name: "",
  thumbnail_path: "",
  date_read: new Date().toISOString().slice(0, 10),
  category: "",
  summary: "",
  key_takeaways: [],
  personal_thoughts: "",
  rating: null,
  read_depth: "surface",
  triage_status: "inbox",
  reading_priority: "normal",
  reading_intent: "",
  decision: "maybe",
  progress_current: 0,
  progress_total: 0,
  progress_unit: "pages",
  completed_at: "",
  published: false,
  created_at: "",
  updated_at: ""
};

const emptyProject: ProjectRow = {
  id: "new",
  slug: "",
  title: "",
  description: "",
  status: "Idea",
  start_date: "",
  end_date: "",
  featured_image_path: "",
  completed_at: "",
  problem: "",
  solution: "",
  architecture: [],
  lessons_learned: [],
  roadmap: [],
  links: [],
  published: false,
  created_at: "",
  updated_at: ""
};

const emptyInterest: InterestRow = {
  id: "new",
  slug: "",
  title: "",
  overview: "",
  key_questions: [],
  favorite_books: [],
  favorite_articles: [],
  favorite_thinkers: [],
  current_thoughts: "",
  published: false,
  created_at: "",
  updated_at: ""
};

const emptyTopOfMind: TopOfMindRow = {
  id: "new",
  title: "",
  description: "",
  url: "",
  link_label: "",
  sort_order: 0,
  published: false,
  created_at: "",
  updated_at: ""
};

const emptyAboutPage: AboutPageRow = defaultAboutRow();

function linksToText(value?: Array<{ label?: string; title?: string; href: string }> | null) {
  return (value ?? []).map((link) => `${link.label ?? link.title ?? "Link"} | ${link.href}`).join("\n");
}

function textToLinks(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label: label || "Link", href: href || label };
    });
}

function timelineToText(value?: Array<{ date: string; body: string }> | null) {
  return (value ?? []).map((item) => `${item.date} | ${item.body}`).join("\n");
}

function textToTimeline(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, ...bodyParts] = line.split("|").map((part) => part.trim());
      return { date: date || "Now", body: bodyParts.join(" | ") || date };
    });
}

function displayStatus(row: EditableRow) {
  if ("headline" in row) {
    return "Resume content";
  }

  if ("draft" in row) {
    return row.draft ? "Draft" : "Published";
  }

  return row.published ? "Published" : "Draft";
}

function itemTitle(row: EditableRow) {
  if ("headline" in row) {
    return row.headline || "About";
  }

  return row.title || "Untitled";
}

function itemKind(row: EditableRow) {
  if ("source_url" in row) {
    return "reading";
  }

  if ("overview" in row) {
    return "interests";
  }

  if ("sort_order" in row) {
    return "top-of-mind";
  }

  if ("headline" in row) {
    return "about";
  }

  return "projects";
}

function progressPercent(current?: number | null, total?: number | null) {
  if (!current || !total || total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / total) * 100));
}

function readingStatusLabel(item: ReadingRow) {
  const percent = progressPercent(item.progress_current, item.progress_total);

  if (percent >= 100) {
    return item.completed_at ? `Completed ${item.completed_at}` : "Complete";
  }

  return percent > 0 ? `${percent}% complete` : "In progress";
}

type AdminConsoleProps = {
  initialData: AdminData;
  user: AdminUser;
};

export function AdminConsole({ initialData, user }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<TabId>("reading");
  const [data, setData] = useState(initialData);
  const [selectedId, setSelectedId] = useState<string>(initialData.reading[0]?.id ?? "new");
  const [draft, setDraft] = useState<EditableRow>(initialData.reading[0] ?? emptyReading);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visibleItems = useMemo(() => {
    if (activeTab === "drafts") {
      return [
        ...data.reading.filter((item) => !item.published),
        ...data.projects.filter((item) => !item.published),
        ...data.interests.filter((item) => !item.published),
        ...data.topOfMind.filter((item) => !item.published)
      ];
    }

    if (activeTab === "media") {
      return [];
    }

    return data[activeTab];
  }, [activeTab, data]);

  const metrics = useMemo(
    () => [
      ["Projects", data.projects.length],
      ["Reading", data.reading.length],
      ["Interests", data.interests.length],
      ["Top of Mind", data.topOfMind.length]
    ],
    [data]
  );

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    setStatus(null);

    const firstItem = tab === "drafts" || tab === "media" ? undefined : data[tab][0];
    if (firstItem) {
      setSelectedId(firstItem.id);
      setDraft(firstItem);
    } else {
      startNew(tab);
    }
  }

  function startNew(tab = activeTab) {
    const nextDraft = tab === "aboutPage" ? emptyAboutPage : tab === "projects" ? emptyProject : tab === "interests" ? emptyInterest : tab === "topOfMind" ? emptyTopOfMind : emptyReading;
    setSelectedId("new");
    setDraft({ ...nextDraft });
  }

  function selectItem(row: EditableRow) {
    setSelectedId(row.id);
    setDraft(row);
    setStatus(null);
  }

  function updateDraft(key: string, value: unknown) {
    setDraft((current) => {
      const next = { ...current, [key]: value } as EditableRow;

      if (key === "title" && "slug" in next && !next.slug) {
        next.slug = slugify(String(value));
      }

      return next;
    });
  }

  function getTableName(): AdminTable {
    if ("source_url" in draft) {
      return "reading";
    }

    if ("overview" in draft) {
      return "interests";
    }

    if ("sort_order" in draft) {
      return "top_of_mind";
    }

    if ("headline" in draft) {
      return "about_page";
    }

    return "projects";
  }

  async function saveDraft(options: { publish?: boolean } = {}) {
    const supabase = createClient();
    const table = getTableName();
    const isNew = selectedId === "new";
    const now = new Date().toISOString();
    const publish = options.publish ?? false;
    setIsSaving(true);
    setStatus(null);

    const { saved, error } = user.isLocalBypass
      ? await saveViaLocalBypass(table, draft, selectedId, isNew, publish)
      : table === "reading"
          ? await saveReading(supabase, draft as ReadingRow, selectedId, isNew, publish, now)
          : table === "projects"
            ? await saveProject(supabase, draft as ProjectRow, selectedId, isNew, publish, now)
            : table === "interests"
              ? await saveInterest(supabase, draft as InterestRow, selectedId, isNew, publish, now)
              : table === "top_of_mind"
                ? await saveTopOfMind(supabase, draft as TopOfMindRow, selectedId, isNew, publish, now)
                : await saveAboutPage(supabase, draft as AboutPageRow, selectedId, isNew, now);
    setIsSaving(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus(table === "about_page" ? "About page saved." : publish ? "Published live." : "Saved as draft. Use Publish live to show it on the site.");
    setSelectedId(saved!.id);
    setDraft(saved as EditableRow);
    setData((current) => upsertLocal(current, table, saved as EditableRow));
  }

  async function deleteDraft() {
    if (selectedId === "new") {
      startNew();
      return;
    }

    const supabase = createClient();
    const table = getTableName();
    setIsSaving(true);
    const { error } = user.isLocalBypass
      ? await deleteViaLocalBypass(table, selectedId)
      : table === "reading"
          ? await supabase.from("reading").delete().eq("id", selectedId)
          : table === "projects"
            ? await supabase.from("projects").delete().eq("id", selectedId)
            : table === "interests"
              ? await supabase.from("interests").delete().eq("id", selectedId)
              : table === "top_of_mind"
                ? await supabase.from("top_of_mind").delete().eq("id", selectedId)
                : await supabase.from("about_page").delete().eq("id", selectedId);
    setIsSaving(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setData((current) => removeLocal(current, table, selectedId));
    setStatus("Deleted.");
    startNew(activeTab);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function extractUrl() {
    if (!url.trim()) {
      setStatus("Paste a URL first.");
      return;
    }

    setStatus("Extracting metadata...");
    const response = await fetch("/api/extract-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const metadata = (await response.json()) as { title?: string; author?: string; source?: string; thumbnail?: string | null; error?: string };

    if (!response.ok) {
      setStatus(metadata.error ?? "Could not extract URL.");
      return;
    }

    setActiveTab("reading");
    setSelectedId("new");
    setDraft({
      ...emptyReading,
      title: metadata.title ?? "",
      slug: slugify(metadata.title ?? ""),
      author: metadata.author ?? "",
      source_url: metadata.source ?? url,
      thumbnail_path: metadata.thumbnail ?? ""
    });
    setStatus("Metadata extracted into a reading draft.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-6">
        <div className="border border-rule bg-paper p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Signed in</p>
          <p className="mt-2 break-words font-serif text-2xl">{user.email}</p>
          <p className="mt-2 text-sm text-muted">{user.isOwner ? "Owner access enabled." : "Owner access missing. Set profiles.is_owner to true in Supabase."}</p>
          <button type="button" onClick={signOut} className="mt-4 border border-rule px-3 py-2 text-sm text-muted hover:text-ink">
            Sign out
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`flex min-h-11 items-center gap-3 border px-3 text-left text-sm transition ${
                  activeTab === tab.id ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-muted hover:text-ink"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="border border-rule bg-paper p-4">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-serif text-4xl">{value}</p>
            </div>
          ))}
        </div>

        <section className="border border-rule bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Reading workflow</p>
              <h2 className="font-serif text-2xl font-normal">Paste URL, extract metadata, add thought</h2>
            </div>
            <button type="button" onClick={extractUrl} className="inline-flex min-h-10 items-center gap-2 border border-ink px-3 text-sm">
              <Sparkles size={16} />
              Extract
            </button>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
            <label className="flex min-h-11 items-center gap-3 border border-rule px-3">
              <LinkIcon size={17} className="text-muted" />
              <input value={url} onChange={(event) => setUrl(event.target.value)} className="w-full bg-transparent outline-none" placeholder="https://..." />
            </label>
            <button type="button" onClick={() => saveDraft({ publish: true })} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-4 text-paper disabled:opacity-50">
              <Send size={16} />
              Publish Current
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="border border-rule bg-paper">
            <div className="flex items-center justify-between border-b border-rule p-3">
              <h2 className="font-serif text-2xl font-normal capitalize">{activeTab === "aboutPage" ? "About" : activeTab}</h2>
              {activeTab !== "drafts" && activeTab !== "media" ? (
                <button type="button" onClick={() => startNew()} className="inline-flex size-9 items-center justify-center border border-rule" aria-label="New item">
                  <Plus size={17} />
                </button>
              ) : null}
            </div>
            <div className="divide-y divide-rule">
              {activeTab === "media" ? (
                <div className="p-4 text-sm text-muted">Media uploads will use Supabase Storage. The database-backed content editor is ready first.</div>
              ) : null}
              {visibleItems.map((item) => (
                <button
                  key={`${itemKind(item)}-${item.id}`}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`block w-full px-4 py-3 text-left transition hover:bg-wash ${selectedId === item.id ? "bg-wash" : ""}`}
                >
                  <p className="font-serif text-xl leading-tight">{itemTitle(item)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{"source_url" in item ? readingStatusLabel(item) : displayStatus(item)}</p>
                </button>
              ))}
            </div>
          </div>

          <EditorPanel draft={draft} isSaving={isSaving} status={status} onChange={updateDraft} onSave={() => saveDraft()} onPublish={() => saveDraft({ publish: true })} onDelete={deleteDraft} />
        </section>
      </main>
    </div>
  );
}

async function saveReading(supabase: ReturnType<typeof createClient>, item: ReadingRow, selectedId: string, isNew: boolean, publish: boolean, now: string) {
  const payload = buildPayload("reading", item, publish);
  const result = isNew
    ? await supabase.from("reading").insert(payload as never).select("*").single()
    : await supabase.from("reading").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  return { saved: result.data, error: result.error };
}

async function saveProject(supabase: ReturnType<typeof createClient>, item: ProjectRow, selectedId: string, isNew: boolean, publish: boolean, now: string) {
  const payload = buildPayload("projects", item, publish);
  const result = isNew
    ? await supabase.from("projects").insert(payload as never).select("*").single()
    : await supabase.from("projects").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  return { saved: result.data, error: result.error };
}

async function saveInterest(supabase: ReturnType<typeof createClient>, item: InterestRow, selectedId: string, isNew: boolean, publish: boolean, now: string) {
  const payload = buildPayload("interests", item, publish);
  const result = isNew
    ? await supabase.from("interests").insert(payload as never).select("*").single()
    : await supabase.from("interests").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  return { saved: result.data, error: result.error };
}

async function saveTopOfMind(supabase: ReturnType<typeof createClient>, item: TopOfMindRow, selectedId: string, isNew: boolean, publish: boolean, now: string) {
  const payload = buildPayload("top_of_mind", item, publish);
  const result = isNew
    ? await supabase.from("top_of_mind").insert(payload as never).select("*").single()
    : await supabase.from("top_of_mind").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  return { saved: result.data, error: result.error };
}

async function saveAboutPage(supabase: ReturnType<typeof createClient>, item: AboutPageRow, selectedId: string, isNew: boolean, now: string) {
  const payload = buildPayload("about_page", item, true);
  const result = isNew
    ? await supabase.from("about_page").insert(payload as never).select("*").single()
    : await supabase.from("about_page").update({ ...payload, updated_at: now } as never).eq("id", selectedId).select("*").single();
  return { saved: result.data, error: result.error };
}

async function saveViaLocalBypass(table: AdminTable, draft: EditableRow, selectedId: string, isNew: boolean, publish: boolean) {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", table, draft, selectedId, isNew, publish })
  });
  const result = (await response.json()) as { saved?: EditableRow; error?: string };

  return {
    saved: result.saved ?? null,
    error: result.error ? { message: result.error } : null
  };
}

async function deleteViaLocalBypass(table: AdminTable, selectedId: string) {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", table, selectedId })
  });
  const result = (await response.json()) as { error?: string };

  return {
    error: result.error ? { message: result.error } : null
  };
}

function upsertLocal(current: AdminData, table: string, saved: EditableRow): AdminData {
  const key = table === "projects" ? "projects" : table === "interests" ? "interests" : table === "top_of_mind" ? "topOfMind" : table === "about_page" ? "aboutPage" : table;
  const list = current[key as keyof AdminData] as EditableRow[];
  const exists = list.some((item) => item.id === saved.id);
  const nextList = exists ? list.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...list];

  return { ...current, [key]: nextList };
}

function removeLocal(current: AdminData, table: string, id: string): AdminData {
  const key = table === "projects" ? "projects" : table === "interests" ? "interests" : table === "top_of_mind" ? "topOfMind" : table === "about_page" ? "aboutPage" : table;
  const list = current[key as keyof AdminData] as EditableRow[];
  return { ...current, [key]: list.filter((item) => item.id !== id) };
}

type EditorPanelProps = {
  draft: EditableRow;
  isSaving: boolean;
  status: string | null;
  onChange: (key: string, value: unknown) => void;
  onSave: () => void;
  onPublish: () => void;
  onDelete: () => void;
};

function EditorPanel({ draft, isSaving, status, onChange, onSave, onPublish, onDelete }: EditorPanelProps) {
  const title = "title" in draft ? draft.title : "";
  const titleLabel = "source_url" in draft ? "Headline" : "Title";

  return (
    <div className="border border-rule bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{"headline" in draft ? "Resume content" : displayStatus(draft)}</p>
          <h2 className="font-serif text-2xl font-normal">{"headline" in draft ? draft.headline || "About" : title || "New item"}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onDelete} disabled={isSaving} className="inline-flex min-h-10 items-center gap-2 border border-rule px-3 text-sm text-rust disabled:opacity-50">
            <Trash2 size={16} />
            Delete
          </button>
          <button type="button" onClick={onSave} disabled={isSaving} className="inline-flex min-h-10 items-center gap-2 border border-ink px-3 text-sm disabled:opacity-50">
            <Save size={16} />
            Save draft
          </button>
          {"headline" in draft ? null : <button type="button" onClick={onPublish} disabled={isSaving} className="inline-flex min-h-10 items-center gap-2 bg-ink px-3 text-sm text-paper disabled:opacity-50">
            <Send size={16} />
            Publish live
          </button>}
        </div>
      </div>
      {status ? <p className="border-b border-rule px-4 py-3 text-sm text-muted">{status}</p> : null}
      <div className="grid gap-4 p-4">
        {"headline" in draft ? <AboutFields draft={draft} onChange={onChange} /> : <Field label={titleLabel} value={draft.title} onChange={(value) => onChange("title", value)} />}

        {"source_url" in draft ? <ReadingFields draft={draft} onChange={onChange} /> : null}
        {"status" in draft ? <ProjectFields draft={draft} onChange={onChange} /> : null}
        {"overview" in draft && !("description" in draft) ? <InterestFields draft={draft} onChange={onChange} /> : null}
        {"sort_order" in draft ? <TopOfMindFields draft={draft} onChange={onChange} /> : null}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string | null; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="min-h-11 border border-rule bg-transparent px-3 outline-none focus:border-ink" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 border border-rule bg-paper px-3 capitalize outline-none focus:border-ink">
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, mono = false }: { label: string; value: string | null; onChange: (value: string) => void; mono?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={`min-h-36 resize-y border border-rule bg-transparent p-3 leading-7 outline-none focus:border-ink ${mono ? "font-mono text-sm" : ""}`} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <input type="number" value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))} className="min-h-11 border border-rule bg-transparent px-3 outline-none focus:border-ink" />
    </label>
  );
}

function TopOfMindFields({ draft, onChange }: { draft: TopOfMindRow; onChange: EditorPanelProps["onChange"] }) {
  return (
    <>
      <TextArea label="Description" value={draft.description} onChange={(value) => onChange("description", value)} />
      <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
        <Field label="URL" value={draft.url} onChange={(value) => onChange("url", value)} />
        <NumberField label="Sort order" value={draft.sort_order} onChange={(value) => onChange("sort_order", value)} />
      </div>
      <Field label="Link label" value={draft.link_label} onChange={(value) => onChange("link_label", value)} />
    </>
  );
}

function AboutFields({ draft, onChange }: { draft: AboutPageRow; onChange: EditorPanelProps["onChange"] }) {
  return (
    <>
      <Field label="Page headline" value={draft.headline} onChange={(value) => onChange("headline", value)} />
      <TextArea label="Bio" value={draft.bio} onChange={(value) => onChange("bio", value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Current role" value={draft.current_role} onChange={(value) => onChange("current_role", value)} />
        <Field label="Location" value={draft.location} onChange={(value) => onChange("location", value)} />
      </div>
      <TextArea label="Career timeline, one per line as Date | Description" value={timelineToText(draft.timeline)} onChange={(value) => onChange("timeline", textToTimeline(value))} />
      <TextArea label="Skills" value={draft.skills} onChange={(value) => onChange("skills", value)} />
      <TextArea label="Selected work" value={draft.selected_work} onChange={(value) => onChange("selected_work", value)} />
      <TextArea label="Education" value={draft.education} onChange={(value) => onChange("education", value)} />
      <TextArea label="Personal interests" value={draft.personal_interests} onChange={(value) => onChange("personal_interests", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Email" value={draft.contact_email} onChange={(value) => onChange("contact_email", value)} />
        <Field label="GitHub URL" value={draft.github_url} onChange={(value) => onChange("github_url", value)} />
        <Field label="LinkedIn URL" value={draft.linkedin_url} onChange={(value) => onChange("linkedin_url", value)} />
      </div>
    </>
  );
}

function ReadingFields({ draft, onChange }: { draft: ReadingRow; onChange: EditorPanelProps["onChange"] }) {
  const percent = progressPercent(draft.progress_current, draft.progress_total);

  return (
    <>
      <TextArea label="Subheader" value={draft.summary} onChange={(value) => onChange("summary", value)} />
      <section className="border border-rule p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Progress</p>
            <p className="mt-1 font-serif text-2xl font-normal">{readingStatusLabel(draft)}</p>
          </div>
          <div className="h-2 w-40 border border-rule bg-wash">
            <div className="h-full bg-ink" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <NumberField label="Length" value={draft.progress_total} onChange={(value) => onChange("progress_total", value)} />
          <NumberField label="Current" value={draft.progress_current} onChange={(value) => onChange("progress_current", value)} />
          <SelectField label="Unit" value={draft.progress_unit ?? "pages"} options={["pages", "minutes", "percent"]} onChange={(value) => onChange("progress_unit", value)} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Link" value={draft.source_url} onChange={(value) => onChange("source_url", value)} />
        <Field label="Date" value={draft.completed_at} onChange={(value) => onChange("completed_at", value)} type="date" />
      </div>
    </>
  );
}

function ProjectFields({ draft, onChange }: { draft: ProjectRow; onChange: EditorPanelProps["onChange"] }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Status</span>
          <select value={draft.status} onChange={(event) => onChange("status", event.target.value as ProjectRow["status"])} className="min-h-11 border border-rule bg-paper px-3 outline-none focus:border-ink">
            {["Idea", "Active", "Paused", "Completed"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <Field label="Start date" value={draft.start_date} onChange={(value) => onChange("start_date", value)} type="date" />
        <Field label="Completed date" value={draft.completed_at} onChange={(value) => onChange("completed_at", value)} type="date" />
      </div>
      <TextArea label="Description" value={draft.description} onChange={(value) => onChange("description", value)} />
      <TextArea label="Links, one per line as Label | URL" value={linksToText(draft.links)} onChange={(value) => onChange("links", textToLinks(value))} />
    </>
  );
}

function InterestFields({ draft, onChange }: { draft: InterestRow; onChange: EditorPanelProps["onChange"] }) {
  return (
    <>
      <TextArea label="Overview" value={draft.overview} onChange={(value) => onChange("overview", value)} />
      <TextArea label="Favorite articles, one per line as Title | URL" value={linksToText(draft.favorite_articles)} onChange={(value) => onChange("favorite_articles", textToLinks(value).map((link) => ({ title: link.label, href: link.href })))} />
      <TextArea label="Current thoughts" value={draft.current_thoughts} onChange={(value) => onChange("current_thoughts", value)} />
    </>
  );
}
