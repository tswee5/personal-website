import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { interests } from "@/lib/content";
import { getPublicInterest } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return interests.map((item) => ({ slug: item.slug }));
}

export default async function InterestDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const interest = await getPublicInterest(slug);

  if (!interest) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">{interest.title}</h1>
      <p className="mt-6 text-xl leading-8 text-muted">{interest.overview}</p>
      <article className="prose-garden mt-12">
        <h2>Key Questions</h2>
        <ul>{interest.keyQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Favorite Books</h2>
        <ul>{interest.favoriteBooks.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Favorite Articles</h2>
        <ul>
          {interest.favoriteArticles.map((item) => (
            <li key={item.title}><Link href={item.href}>{item.title}</Link></li>
          ))}
        </ul>
        <h2>Favorite Thinkers</h2>
        <ul>{interest.favoriteThinkers.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Current Thoughts</h2>
        <p>{interest.currentThoughts}</p>
      </article>
      <RelatedContent related={interest.related} />
    </main>
  );
}
