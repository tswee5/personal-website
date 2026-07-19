import { ContentList } from "@/components/content-list";
import { getPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const posts = await getPosts();
  const writing = posts.map((post) => ({
    kind: "writing" as const,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    publishDate: post.publishedAt,
    status: post.readingTime,
    tags: post.tags
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">Writing</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">Essays published on Substack and rendered here with the site&apos;s own typography, navigation, and archive structure.</p>
      <div className="mt-12">
        <ContentList items={writing} />
      </div>
    </main>
  );
}
