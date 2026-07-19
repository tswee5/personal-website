import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  href?: string;
};

export function SectionHeading({ eyebrow, title, href }: SectionHeadingProps) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6 border-t border-rule pt-5">
      <div>
        {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{eyebrow}</p> : null}
        <h2 className="font-serif text-3xl font-normal leading-tight sm:text-4xl">{title}</h2>
      </div>
      {href ? (
        <Link className="hidden text-sm text-muted underline underline-offset-4 transition hover:text-ink sm:inline" href={href}>
          View all
        </Link>
      ) : null}
    </div>
  );
}
