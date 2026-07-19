import { SectionHeading } from "@/components/section-heading";
import { getPublicAboutPage } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getPublicAboutPage();

  return (
    <main className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-6xl font-normal leading-none sm:text-7xl">{about.headline}</h1>
      <p className="mt-8 max-w-3xl text-xl leading-8 text-muted">{about.bio}</p>

      {about.currentRole || about.location ? (
        <section className="mt-12 grid gap-6 border-y border-rule py-6 md:grid-cols-2">
          {about.currentRole ? (
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Current Role</p>
              <p className="mt-2 text-lg">{about.currentRole}</p>
            </div>
          ) : null}
          {about.location ? (
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Location</p>
              <p className="mt-2 text-lg">{about.location}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-16">
        <SectionHeading title="Career Timeline" />
        <div className="divide-y divide-rule border-y border-rule">
          {about.timeline.map(({ date, body }) => (
            <div key={date} className="grid gap-4 py-5 sm:grid-cols-[8rem_1fr]">
              <p className="text-muted">{date}</p>
              <p className="text-lg">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <SectionHeading title="Skills" />
          <p className="text-muted">{about.skills}</p>
        </div>
        <div>
          <SectionHeading title="Education" />
          <p className="text-muted">{about.education}</p>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading title="Selected Work" />
        <p className="max-w-3xl text-muted">{about.selectedWork}</p>
      </section>

      <section className="mt-16">
        <SectionHeading title="Personal Interests" />
        <p className="max-w-3xl text-muted">{about.personalInterests}</p>
      </section>

      {about.contactEmail || about.githubUrl || about.linkedinUrl ? (
        <section className="mt-16">
          <SectionHeading title="Contact" />
          <div className="flex flex-wrap gap-3">
            {about.contactEmail ? <a className="border border-rule px-3 py-2 text-sm underline-offset-4 hover:underline" href={`mailto:${about.contactEmail}`}>Email</a> : null}
            {about.githubUrl ? <a className="border border-rule px-3 py-2 text-sm underline-offset-4 hover:underline" href={about.githubUrl}>GitHub</a> : null}
            {about.linkedinUrl ? <a className="border border-rule px-3 py-2 text-sm underline-offset-4 hover:underline" href={about.linkedinUrl}>LinkedIn</a> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
