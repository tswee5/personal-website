import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-6xl border-t border-rule px-4 py-10 text-sm text-muted sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <p className="max-w-2xl">
          A public notebook for engineering, reading, and long-running questions. Built to age slowly.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="https://github.com/">GitHub</Link>
          <Link href="https://www.linkedin.com/">LinkedIn</Link>
          <Link href="mailto:hello@example.com">Email</Link>
        </div>
      </div>
    </footer>
  );
}
