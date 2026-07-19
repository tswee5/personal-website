import { writing } from "@/lib/content";
import { slugify } from "@/lib/admin-payloads";

export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  html: string;
  publishedAt: string;
  readingTime: string;
  sourceUrl: string;
  tags: string[];
};

const fallbackPosts: Post[] = writing.map((post) => ({
  slug: post.slug,
  title: post.title,
  subtitle: post.subtitle,
  excerpt: post.body,
  html: `<p>${escapeHtml(post.body)}</p>`,
  publishedAt: post.publishDate,
  readingTime: post.readingTime,
  sourceUrl: "#",
  tags: post.tags
}));

export async function getPosts(): Promise<Post[]> {
  const feedUrl = getFeedUrl();

  if (!feedUrl) {
    return fallbackPosts;
  }

  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      return fallbackPosts;
    }

    const xml = await response.text();
    const posts = parseFeed(xml);

    return posts.length ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

export async function getPostBySlug(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getSubscribeUrl() {
  return process.env.SUBSTACK_PUBLICATION_URL ?? process.env.NEXT_PUBLIC_SUBSTACK_URL ?? "#";
}

function getFeedUrl() {
  if (process.env.SUBSTACK_FEED_URL) {
    return process.env.SUBSTACK_FEED_URL;
  }

  const publicationUrl = process.env.SUBSTACK_PUBLICATION_URL ?? process.env.NEXT_PUBLIC_SUBSTACK_URL;

  if (!publicationUrl) {
    return null;
  }

  return `${publicationUrl.replace(/\/$/, "")}/feed`;
}

function parseFeed(xml: string): Post[] {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/g)].map((match) => parseItem(match[0])).filter((post): post is Post => Boolean(post));
}

function parseItem(itemXml: string): Post | null {
  const title = readTag(itemXml, "title");
  const sourceUrl = readTag(itemXml, "link");
  const publishedAt = readTag(itemXml, "pubDate");
  const html = readTag(itemXml, "content:encoded") ?? readTag(itemXml, "description") ?? "";
  const excerpt = stripHtml(readTag(itemXml, "description") ?? html).slice(0, 240);
  const categories = [...itemXml.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/g)].map((match) => decodeXml(match[1]).trim()).filter(Boolean);

  if (!title || !sourceUrl) {
    return null;
  }

  return {
    slug: slugFromLink(sourceUrl, title),
    title,
    subtitle: excerpt,
    excerpt,
    html,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString().slice(0, 10) : "",
    readingTime: estimateReadingTime(stripHtml(html)),
    sourceUrl,
    tags: categories
  };
}

function readTag(xml: string, tag: string) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : null;
}

function slugFromLink(link: string, title: string) {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return slugify(pathParts[pathParts.length - 1] ?? title);
  } catch {
    return slugify(title);
  }
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 225))} min`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
