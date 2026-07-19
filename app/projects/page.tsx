import { ContentList } from "@/components/content-list";
import { getPublicCollections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { projects } = await getPublicCollections();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">Projects</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">Active and historical work, with notes on problem framing, architecture, lessons, and what might happen next.</p>
      <div className="mt-12">
        <ContentList items={projects} />
      </div>
    </main>
  );
}
