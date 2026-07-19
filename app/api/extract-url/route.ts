import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 personal-website-admin"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Could not fetch source: ${response.status}` }, { status: 422 });
    }

    const html = await response.text();

    return NextResponse.json({
      title: getMeta(html, "og:title") ?? getTitle(html) ?? "Untitled source",
      author: getMeta(html, "author") ?? getMeta(html, "article:author") ?? "",
      source: url,
      thumbnail: getMeta(html, "og:image") ?? getMeta(html, "twitter:image") ?? null
    });
  } catch {
    return NextResponse.json({ error: "Could not extract metadata from that URL." }, { status: 422 });
  }
}

function getTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
}

function getMeta(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const propertyPattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const reversedPattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedName}["'][^>]*>`, "i");

  return propertyPattern.exec(html)?.[1]?.trim() ?? reversedPattern.exec(html)?.[1]?.trim();
}
