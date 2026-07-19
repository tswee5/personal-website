import Link from "next/link";
import { getPublicCollections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  const { interests } = await getPublicCollections();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">Interests</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">A public map of ongoing questions, favorite sources, and current thoughts.</p>
      <div className="mt-12 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest) => (
          <Link key={interest.slug} href={`/interests/${interest.slug}`} className="bg-paper p-5 transition hover:bg-wash">
            <h2 className="font-serif text-3xl font-normal">{interest.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{interest.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
