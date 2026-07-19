import { ContentList } from "@/components/content-list";
import { getPublicCollections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function ReadingPage() {
  const { reading } = await getPublicCollections();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">Reading</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">A public reading log for books, articles, papers, and ideas worth returning to.</p>
      <div className="mt-12">
        <ContentList items={reading} />
      </div>
    </main>
  );
}
