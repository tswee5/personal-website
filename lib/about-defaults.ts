import type { AboutPageRow } from "@/lib/admin-types";
import type { PublicAboutPage } from "@/lib/public-content";

export const defaultAboutPage = {
  headline: "About",
  bio: "I am an engineer interested in the overlap between software, knowledge, institutions, and the habits that let people do clearer work.",
  currentRole: "Building personal knowledge tools and publishing systems.",
  location: "",
  timeline: [
    { date: "Now", body: "Building personal knowledge tools and publishing systems." },
    { date: "2025", body: "Focused on reader workflows, AI-assisted interfaces, and durable notes." },
    { date: "Earlier", body: "Worked across product engineering, web systems, and data-heavy applications." }
  ],
  skills: "TypeScript, React, Next.js, Node, Postgres, Supabase, product engineering, systems thinking, writing, technical discovery.",
  selectedWork: "Projects, products, and systems that connect software, learning, and durable knowledge work.",
  education: "A living mix of formal study, shipped software, books, essays, and carefully chosen rabbit holes.",
  personalInterests: "Politics, science, business, entrepreneurship, technology, culture, sports, economics, history, psychology, and AI.",
  contactEmail: "",
  githubUrl: "",
  linkedinUrl: ""
};

export function defaultAboutRow(): AboutPageRow {
  return {
    id: "new",
    headline: defaultAboutPage.headline,
    bio: defaultAboutPage.bio,
    current_role: defaultAboutPage.currentRole,
    location: defaultAboutPage.location,
    timeline: defaultAboutPage.timeline,
    skills: defaultAboutPage.skills,
    selected_work: defaultAboutPage.selectedWork,
    education: defaultAboutPage.education,
    personal_interests: defaultAboutPage.personalInterests,
    contact_email: defaultAboutPage.contactEmail,
    github_url: defaultAboutPage.githubUrl,
    linkedin_url: defaultAboutPage.linkedinUrl,
    updated_at: ""
  };
}

export function defaultPublicAboutPage(): PublicAboutPage {
  return defaultAboutPage;
}
