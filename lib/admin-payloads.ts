import type { AboutPageRow, InterestRow, ProjectRow, ReadingRow, TopOfMindRow, WritingRow } from "@/lib/admin-types";

export type AdminTable = "writing" | "reading" | "projects" | "interests" | "top_of_mind" | "about_page";
export type EditableAdminRow = WritingRow | ReadingRow | ProjectRow | InterestRow | TopOfMindRow | AboutPageRow;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function coerceNullable(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

export function buildPayload(table: AdminTable, draft: EditableAdminRow, publish: boolean) {
  if (table === "writing") {
    const item = draft as WritingRow;
    return {
      slug: item.slug || slugify(item.title),
      type: item.type,
      title: item.title || "Untitled",
      subtitle: coerceNullable(item.subtitle),
      body_mdx: item.body_mdx,
      reading_time: coerceNullable(item.reading_time),
      draft: publish ? false : item.draft,
      published_at: publish ? new Date().toISOString() : item.published_at
    };
  }

  if (table === "reading") {
    const item = draft as ReadingRow;
    return {
      slug: item.slug || slugify(item.title),
      title: item.title || "Untitled",
      author: coerceNullable(item.author),
      source_url: coerceNullable(item.source_url),
      source_name: coerceNullable(item.source_name),
      thumbnail_path: coerceNullable(item.thumbnail_path),
      date_read: coerceNullable(item.date_read),
      category: coerceNullable(item.category),
      summary: coerceNullable(item.summary),
      key_takeaways: item.key_takeaways,
      personal_thoughts: coerceNullable(item.personal_thoughts),
      rating: item.rating,
      read_depth: item.read_depth,
      triage_status: item.triage_status,
      reading_priority: item.reading_priority,
      reading_intent: coerceNullable(item.reading_intent),
      decision: item.decision,
      progress_current: item.progress_current,
      progress_total: item.progress_total,
      progress_unit: item.progress_unit ?? "pages",
      completed_at: coerceNullable(item.completed_at),
      published: publish || item.published
    };
  }

  if (table === "projects") {
    const item = draft as ProjectRow;
    return {
      slug: item.slug || slugify(item.title),
      title: item.title || "Untitled",
      description: item.description,
      status: item.status,
      start_date: coerceNullable(item.start_date),
      end_date: coerceNullable(item.end_date),
      featured_image_path: coerceNullable(item.featured_image_path),
      completed_at: coerceNullable(item.completed_at),
      problem: coerceNullable(item.problem),
      solution: coerceNullable(item.solution),
      architecture: item.architecture,
      lessons_learned: item.lessons_learned,
      roadmap: item.roadmap,
      links: item.links,
      published: publish || item.published
    };
  }

  if (table === "top_of_mind") {
    const item = draft as TopOfMindRow;
    return {
      title: item.title || "Untitled",
      description: coerceNullable(item.description),
      url: coerceNullable(item.url),
      link_label: coerceNullable(item.link_label),
      sort_order: item.sort_order ?? 0,
      published: publish || item.published
    };
  }

  if (table === "about_page") {
    const item = draft as AboutPageRow;
    return {
      headline: item.headline || "About",
      bio: item.bio,
      current_role: coerceNullable(item.current_role),
      location: coerceNullable(item.location),
      timeline: item.timeline,
      skills: item.skills,
      selected_work: item.selected_work,
      education: item.education,
      personal_interests: item.personal_interests,
      contact_email: coerceNullable(item.contact_email),
      github_url: coerceNullable(item.github_url),
      linkedin_url: coerceNullable(item.linkedin_url)
    };
  }

  const item = draft as InterestRow;
  return {
    slug: item.slug || slugify(item.title),
    title: item.title || "Untitled",
    overview: item.overview,
    key_questions: item.key_questions,
    favorite_books: item.favorite_books,
    favorite_articles: item.favorite_articles,
    favorite_thinkers: item.favorite_thinkers,
    current_thoughts: item.current_thoughts,
    published: publish || item.published
  };
}
