import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts, getSubscribeUrl } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function WritingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-16 sm:px-6 lg:px-8">
      <p className="text-sm text-muted">{post.publishedAt} / {post.readingTime}</p>
      <h1 className="mt-4 font-serif text-6xl font-normal leading-none sm:text-7xl">{post.title}</h1>
      <p className="mt-6 text-2xl leading-9 text-muted">{post.subtitle}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center border border-ink px-4 text-sm" href={getSubscribeUrl()}>
          Subscribe on Substack
        </Link>
        <Link className="inline-flex min-h-11 items-center border border-rule px-4 text-sm text-muted hover:text-ink" href={post.sourceUrl}>
          View original
        </Link>
      </div>
      <article className="prose-garden mt-12 text-lg leading-8" dangerouslySetInnerHTML={{ __html: post.html }} />
      <aside className="mt-12 border-t border-rule pt-6">
        <p className="text-sm text-muted">Writing is published through Substack and rendered natively here. Subscribe there to receive new essays by email.</p>
        <Link className="mt-4 inline-flex min-h-11 items-center bg-ink px-4 text-sm text-paper" href={getSubscribeUrl()}>
          Subscribe on Substack
        </Link>
      </aside>
    </main>
  );
}
