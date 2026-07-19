import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { reading } from "@/lib/content";
import { getPublicReading } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return reading.map((item) => ({ slug: item.slug }));
}

export default async function ReadingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getPublicReading(slug);

  if (!entry) {
    notFound();
  }

  const progressPercent = entry.progressCurrent && entry.progressTotal ? Math.min(100, Math.round((entry.progressCurrent / entry.progressTotal) * 100)) : 0;
  const progressLabel = progressPercent >= 100 ? (entry.completedAt ? `Completed ${entry.completedAt}` : "Complete") : progressPercent > 0 ? `${progressPercent}% complete` : "In progress";

  return (
    <main className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
      <p className="text-sm text-muted">{entry.category || "Reading"}</p>
      <h1 className="mt-4 font-serif text-6xl font-normal leading-none sm:text-7xl">{entry.title}</h1>
      <p className="mt-4 text-xl text-muted">{entry.summary}</p>
      <div className="mt-6 max-w-md">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>{progressLabel}</span>
          {entry.progressCurrent && entry.progressTotal ? (
            <span>
              {entry.progressCurrent} / {entry.progressTotal} {entry.progressUnit ?? "pages"}
            </span>
          ) : null}
        </div>
        <div className="mt-2 h-2 border border-rule bg-wash">
          <div className="h-full bg-ink" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      <Link className="mt-6 inline-block underline underline-offset-4" href={entry.sourceUrl}>Source</Link>
      <article className="prose-garden mt-10">
        {entry.thoughts ? (
          <>
            <h2>Notes</h2>
            <p>{entry.thoughts}</p>
          </>
        ) : null}
      </article>
      <RelatedContent related={entry.related} />
    </main>
  );
}
