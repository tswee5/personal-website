import type { ContentKind, Interest, Project, Reading, Writing } from "@/lib/content";
import { defaultPublicAboutPage } from "@/lib/about-defaults";
import { interests, projects, reading, writing } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type PublicListItem = {
  kind: ContentKind;
  slug: string;
  title: string;
  description?: string;
  subtitle?: string;
  summary?: string;
  tags?: string[];
  publishDate?: string;
  dateRead?: string;
  status?: string;
  externalUrl?: string;
};

function formatReadingProgress(current?: number | null, total?: number | null, completedAt?: string | null) {
  if (!current || !total || total <= 0) {
    return undefined;
  }

  const percent = Math.min(100, Math.round((current / total) * 100));
  return percent >= 100 ? (completedAt ? `Completed ${completedAt}` : "Complete") : `${percent}% complete`;
}

export type PublicCollections = {
  projects: PublicListItem[];
  writing: PublicListItem[];
  reading: PublicListItem[];
  interests: PublicListItem[];
  topOfMind: TopOfMindItem[];
};

export type TopOfMindItem = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  linkLabel?: string;
};

export type PublicAboutPage = {
  headline: string;
  bio: string;
  currentRole?: string;
  location?: string;
  timeline: Array<{ date: string; body: string }>;
  skills: string;
  selectedWork: string;
  education: string;
  personalInterests: string;
  contactEmail?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

export async function getPublicCollections(): Promise<PublicCollections> {
  if (!hasSupabaseConfig()) {
    return fallbackCollections();
  }

  try {
    const supabase = await createClient();
    const [posts, readingResult, projectsResult, interestsResult, topOfMindResult] = await Promise.all([
      getPosts(),
      supabase.from("reading").select("slug,title,author,date_read,category,summary,progress_current,progress_total,completed_at").eq("published", true).order("date_read", { ascending: false }),
      supabase.from("projects").select("slug,title,description,status,start_date,completed_at,links").eq("published", true).order("updated_at", { ascending: false }),
      supabase.from("interests").select("slug,title,overview,updated_at").eq("published", true).order("title", { ascending: true }),
      supabase.from("top_of_mind").select("id,title,description,url,link_label").eq("published", true).order("sort_order", { ascending: true })
    ]);

    const hasAnyRows = Boolean(posts.length || readingResult.data?.length || projectsResult.data?.length || interestsResult.data?.length);

    if (!hasAnyRows && (readingResult.error || projectsResult.error || interestsResult.error)) {
      return fallbackCollections();
    }

    return {
      writing: posts.map((post) => ({
        kind: "writing",
        slug: post.slug,
        title: post.title,
        subtitle: post.subtitle,
        publishDate: post.publishedAt,
        status: post.readingTime,
        tags: post.tags
      })),
      reading: (readingResult.data ?? []).map((item) => ({
        kind: "reading",
        slug: item.slug,
        title: item.title,
        subtitle: item.author ?? undefined,
        summary: item.summary ?? undefined,
        dateRead: item.date_read ?? undefined,
        status: formatReadingProgress(item.progress_current, item.progress_total, item.completed_at),
        tags: item.category ? [item.category] : []
      })),
      projects: (projectsResult.data ?? []).map((item) => ({
        kind: "project",
        slug: item.slug,
        title: item.title,
        description: item.description,
        status: item.status === "Completed" && item.completed_at ? `Completed ${item.completed_at}` : item.status,
        externalUrl: item.links?.[0]?.href
      })),
      interests: (interestsResult.data ?? []).map((item) => ({
        kind: "interest",
        slug: item.slug,
        title: item.title,
        description: item.overview
      })),
      topOfMind:
        topOfMindResult.data?.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? undefined,
          url: item.url ?? undefined,
          linkLabel: item.link_label ?? undefined
        })) ?? fallbackTopOfMind()
    };
  } catch {
    return fallbackCollections();
  }
}

export async function getSearchItems() {
  const collections = await getPublicCollections();
  return [...collections.projects, ...collections.writing, ...collections.reading, ...collections.interests];
}

export async function getPublicAboutPage(): Promise<PublicAboutPage> {
  if (!hasSupabaseConfig()) {
    return fallbackAboutPage();
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("about_page").select("*").order("updated_at", { ascending: false }).limit(1).single();

    if (!data) {
      return fallbackAboutPage();
    }

    return {
      headline: data.headline,
      bio: data.bio,
      currentRole: data.current_role ?? undefined,
      location: data.location ?? undefined,
      timeline: data.timeline ?? [],
      skills: data.skills,
      selectedWork: data.selected_work,
      education: data.education,
      personalInterests: data.personal_interests,
      contactEmail: data.contact_email ?? undefined,
      githubUrl: data.github_url ?? undefined,
      linkedinUrl: data.linkedin_url ?? undefined
    };
  } catch {
    return fallbackAboutPage();
  }
}

export async function getPublicWriting(slug: string): Promise<Writing | null> {
  if (!hasSupabaseConfig()) {
    return writing.find((item) => item.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("writing").select("*").eq("slug", slug).eq("draft", false).single();

  if (!data) {
    return writing.find((item) => item.slug === slug) ?? null;
  }

  return {
    kind: "writing",
    slug: data.slug,
    type: data.type,
    title: data.title,
    subtitle: data.subtitle ?? "",
    publishDate: data.published_at?.slice(0, 10) ?? "",
    tags: [],
    readingTime: data.reading_time ?? "",
    body: data.body_mdx,
    related: []
  };
}

export async function getPublicReading(slug: string): Promise<Reading | null> {
  if (!hasSupabaseConfig()) {
    return reading.find((item) => item.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("reading").select("*").eq("slug", slug).eq("published", true).single();

  if (!data) {
    return reading.find((item) => item.slug === slug) ?? null;
  }

  return {
    kind: "reading",
    slug: data.slug,
    title: data.title,
    author: data.author ?? "",
    sourceUrl: data.source_url ?? "#",
    dateRead: data.date_read ?? "",
    category: data.category ?? "",
    summary: data.summary ?? "",
    progressCurrent: data.progress_current ?? undefined,
    progressTotal: data.progress_total ?? undefined,
    progressUnit: data.progress_unit ?? undefined,
    completedAt: data.completed_at ?? undefined,
    keyTakeaways: data.key_takeaways ?? [],
    thoughts: data.personal_thoughts ?? "",
    rating: data.rating ?? undefined,
    tags: data.category ? [data.category] : [],
    related: []
  };
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  if (!hasSupabaseConfig()) {
    return projects.find((item) => item.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).single();

  if (!data) {
    return projects.find((item) => item.slug === slug) ?? null;
  }

  return {
    kind: "project",
    slug: data.slug,
    title: data.title,
    description: data.description,
    status: data.status,
    startDate: data.start_date ?? "",
    endDate: data.end_date ?? undefined,
    completedAt: data.completed_at ?? undefined,
    tags: [],
    links: data.links ?? [],
    featuredImage: data.featured_image_path ?? "",
    problem: data.problem ?? "",
    solution: data.solution ?? "",
    architecture: data.architecture ?? [],
    lessons: data.lessons_learned ?? [],
    roadmap: data.roadmap ?? [],
    related: []
  };
}

export async function getPublicInterest(slug: string): Promise<Interest | null> {
  if (!hasSupabaseConfig()) {
    return interests.find((item) => item.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("interests").select("*").eq("slug", slug).eq("published", true).single();

  if (!data) {
    return interests.find((item) => item.slug === slug) ?? null;
  }

  return {
    kind: "interest",
    slug: data.slug,
    title: data.title,
    overview: data.overview,
    keyQuestions: data.key_questions ?? [],
    favoriteBooks: data.favorite_books ?? [],
    favoriteArticles: data.favorite_articles ?? [],
    favoriteThinkers: data.favorite_thinkers ?? [],
    currentThoughts: data.current_thoughts,
    tags: [],
    related: []
  };
}

function fallbackCollections(): PublicCollections {
  return {
    projects,
    writing: fallbackWriting(),
    reading,
    interests,
    topOfMind: fallbackTopOfMind()
  };
}

function fallbackWriting(): PublicListItem[] {
  return writing.map((post) => ({
    kind: "writing",
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    publishDate: post.publishDate,
    status: post.readingTime,
    tags: post.tags
  }));
}

function fallbackTopOfMind(): TopOfMindItem[] {
  return [
    {
      id: "knowledge-systems",
      title: "Personal knowledge systems",
      description: "How notes, reading, projects, and questions can compound into a durable public archive."
    },
    {
      id: "ai-interfaces",
      title: "AI interfaces",
      description: "What useful software looks like when the model is part of the workflow instead of the whole product."
    }
  ];
}

function fallbackAboutPage(): PublicAboutPage {
  return defaultPublicAboutPage();
}
