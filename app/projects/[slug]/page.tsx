import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { projects } from "@/lib/content";
import { getPublicProject } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">{project.status}</p>
      <h1 className="mt-4 font-serif text-6xl font-normal leading-none sm:text-7xl">{project.title}</h1>
      <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">{project.description}</p>
      {project.links.length ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.map((link) => (
            <a key={link.href} href={link.href} className="border border-ink px-3 py-2 text-sm underline-offset-4 hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
      <article className="prose-garden mt-12">
        <h2>Problem</h2>
        <p>{project.problem}</p>
        <h2>Solution</h2>
        <p>{project.solution}</p>
        <h2>Architecture</h2>
        <ul>{project.architecture.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Lessons Learned</h2>
        <ul>{project.lessons.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Roadmap</h2>
        <ul>{project.roadmap.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
      <RelatedContent related={project.related} />
    </main>
  );
}
