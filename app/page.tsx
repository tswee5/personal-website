import { ContentList } from "@/components/content-list";
import { ExpandableText } from "@/components/expandable-text";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { getPublicCollections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<{
    code?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const code = Array.isArray(params?.code) ? params.code[0] : params?.code;

  if (code) {
    redirect(`/auth/reset-password?code=${encodeURIComponent(code)}`);
  }

  const { interests, projects, reading, topOfMind, writing } = await getPublicCollections();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <section className="grid min-h-[68vh] content-center gap-10 pb-12 pt-8 md:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <h1 className="max-w-4xl font-serif text-6xl font-normal leading-[0.95] sm:text-7xl lg:text-8xl">Howdy!</h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 text-muted">
            Thanks for visitng my website! I&apos;m Tim, I&apos;m a Product Manager at American Express working on AI and recommendation products in their Digital Labs unit. Outside of work, I would describe myself
            as a general enthusiast and inforvore, who tends to get excited about a wide range of things and is always eager to rabbit hole
          </p>
        </div>
        <TopOfMind items={topOfMind.slice(0, 4)} />
      </section>

      <section className="py-12">
        <SectionHeading eyebrow="Latest" title="Writing" href="/writing" />
        <ContentList items={writing.slice(0, 3)} />
      </section>

      <section className="py-12">
        <SectionHeading eyebrow="Log" title="Reading" href="/reading" />
        <ContentList items={reading.slice(0, 2)} />
      </section>

      <section className="py-12">
        <SectionHeading eyebrow="Selected" title="Projects" href="/projects" />
        <ContentList items={projects.slice(0, 3)} />
      </section>

      <section className="py-12">
        <SectionHeading eyebrow="Map" title="Things I'm Into" href="/interests" />
        <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {interests.slice(0, 9).map((interest) => (
            <article key={interest.slug} className="bg-paper p-5 transition hover:bg-wash">
              <Link className="inline-block font-serif text-2xl font-normal underline-offset-4 hover:underline" href={`/interests/${interest.slug}`}>
                {interest.title}
              </Link>
              <ExpandableText text={interest.description} className="mt-2 text-sm leading-6 text-muted" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

type TopOfMindProps = {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    url?: string;
    linkLabel?: string;
  }>;
};

function TopOfMind({ items }: TopOfMindProps) {
  return (
    <div className="md:border-l md:border-rule md:pl-6">
      <details className="group border-y border-rule py-4 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          Top of mind
          <ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <TopOfMindItems items={items} />
      </details>

      <div className="hidden md:block">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Top of mind</p>
        <TopOfMindItems items={items} />
      </div>
    </div>
  );
}

function TopOfMindItems({ items }: TopOfMindProps) {
  return (
    <div className="mt-6 divide-y divide-rule">
      {items.map((item) => {
        return (
          <article key={item.id} className="py-5">
            <h2 className="font-serif text-2xl font-normal">{item.title}</h2>
            <ExpandableText text={item.description} className="mt-2 text-sm leading-6 text-muted" />
            {item.url ? (
              <a href={item.url} className="mt-3 inline-block text-sm underline underline-offset-4" target="_blank" rel="noreferrer">
                {item.linkLabel ?? "Open link"}
              </a>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
