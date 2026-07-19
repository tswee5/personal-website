export type WritingRow = {
  id: string;
  slug: string;
  type: "Essay" | "Note" | "Mental Model" | "Book Note" | "Article Response" | "Interview Reflection";
  title: string;
  subtitle: string | null;
  body_mdx: string;
  reading_time: string | null;
  published_at: string | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
};

export type ReadingRow = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  source_url: string | null;
  source_name: string | null;
  thumbnail_path: string | null;
  date_read: string | null;
  category: string | null;
  summary: string | null;
  key_takeaways: string[];
  personal_thoughts: string | null;
  rating: number | null;
  read_depth: "surface" | "deep_dive" | "reference" | null;
  triage_status: "inbox" | "queued" | "reading" | "done" | "archived" | null;
  reading_priority: "low" | "normal" | "high" | null;
  reading_intent: string | null;
  decision: "keep" | "purge" | "maybe" | null;
  progress_current: number | null;
  progress_total: number | null;
  progress_unit: "pages" | "minutes" | "percent" | null;
  completed_at: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "Idea" | "Active" | "Paused" | "Completed";
  start_date: string | null;
  end_date: string | null;
  featured_image_path: string | null;
  completed_at: string | null;
  problem: string | null;
  solution: string | null;
  architecture: string[];
  lessons_learned: string[];
  roadmap: string[];
  links: Array<{ label: string; href: string }>;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type InterestRow = {
  id: string;
  slug: string;
  title: string;
  overview: string;
  key_questions: string[];
  favorite_books: string[];
  favorite_articles: Array<{ title: string; href: string }>;
  favorite_thinkers: string[];
  current_thoughts: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type TopOfMindRow = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  link_label: string | null;
  sort_order: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type AboutPageRow = {
  id: string;
  headline: string;
  bio: string;
  current_role: string | null;
  location: string | null;
  timeline: Array<{ date: string; body: string }>;
  skills: string;
  selected_work: string;
  education: string;
  personal_interests: string;
  contact_email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  updated_at: string;
};

export type AdminData = {
  writing: WritingRow[];
  reading: ReadingRow[];
  projects: ProjectRow[];
  interests: InterestRow[];
  topOfMind: TopOfMindRow[];
  aboutPage: AboutPageRow[];
};

export type AdminUser = {
  email: string;
  isOwner: boolean;
  isLocalBypass?: boolean;
};
