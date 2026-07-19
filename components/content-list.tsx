import Link from "next/link";
import { ExpandableText } from "@/components/expandable-text";
import type { ContentKind } from "@/lib/content";

const kindHref: Record<ContentKind, string> = {
  project: "/projects",
  writing: "/writing",
  reading: "/reading",
  interest: "/interests"
};

type ContentListProps = {
  items: Array<{
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
  }>;
};

export function ContentList({ items }: ContentListProps) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {items.map((item) => {
        const meta = item.kind === "reading" ? (item.status ?? item.dateRead) : item.publishDate ?? item.status ?? item.dateRead;
        const href = item.externalUrl ?? `${kindHref[item.kind]}/${item.slug}`;
        const description = item.subtitle ?? item.description ?? item.summary;

        return (
          <article key={`${item.kind}-${item.slug}`} className="grid gap-4 py-5 transition hover:bg-wash/60 sm:grid-cols-[9rem_1fr]">
            <div className="text-sm text-muted">
              <p className="capitalize">{item.kind}</p>
              <p>{meta}</p>
            </div>
            <div>
              <Link className="inline-block font-serif text-2xl font-normal leading-tight underline-offset-4 hover:underline" href={href} target={item.externalUrl ? "_blank" : undefined} rel={item.externalUrl ? "noreferrer" : undefined}>
                {item.title}
              </Link>
              <ExpandableText text={description} className="mt-2 max-w-3xl text-muted" />
              {item.externalUrl ? (
                <Link className="mt-3 inline-block text-sm underline underline-offset-4" href={item.externalUrl} target="_blank" rel="noreferrer">
                  Open project
                </Link>
              ) : null}
              {item.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="border border-rule px-2 py-1 text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
