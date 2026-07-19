import Link from "next/link";
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
        const className = "grid gap-4 py-5 transition hover:bg-wash/60 sm:grid-cols-[9rem_1fr]";
        const content = (
          <>
            <div className="text-sm text-muted">
              <p className="capitalize">{item.kind}</p>
              <p>{meta}</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-normal leading-tight">{item.title}</h3>
              <p className="mt-2 max-w-3xl text-muted">{item.subtitle ?? item.description ?? item.summary}</p>
              {item.externalUrl ? <p className="mt-3 text-sm underline underline-offset-4">Open project</p> : null}
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
          </>
        );

        return item.externalUrl ? (
          <a key={`${item.kind}-${item.slug}`} className={className} href={item.externalUrl} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <Link key={`${item.kind}-${item.slug}`} className={className} href={`${kindHref[item.kind]}/${item.slug}`}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
