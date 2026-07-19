import { ContentList } from "@/components/content-list";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getPublicCollections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
        <div className="border-l border-rule pl-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Currently Thinking About</p>
          <div className="mt-6 divide-y divide-rule">
            {topOfMind.slice(0, 4).map((item) => {
              const content = (
                <>
                  <h2 className="font-serif text-2xl font-normal">{item.title}</h2>
                  {item.description ? <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p> : null}
                  {item.url ? <p className="mt-3 text-sm underline underline-offset-4">{item.linkLabel ?? "Open link"}</p> : null}
                </>
              );

              return item.url ? (
                <a key={item.id} href={item.url} className="block py-5 transition hover:bg-wash" target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <div key={item.id} className="py-5">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
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
            <Link key={interest.slug} href={`/interests/${interest.slug}`} className="bg-paper p-5 transition hover:bg-wash">
              <h3 className="font-serif text-2xl font-normal">{interest.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{interest.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
