import Link from "next/link";
import { Search } from "lucide-react";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Writing", "/writing"],
  ["Reading", "/reading"],
  ["Interests", "/interests"]
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-3 sm:top-5">
      <nav className="flex min-h-12 items-center justify-between gap-3 border border-rule bg-paper/95 px-3 py-2 shadow-sm backdrop-blur sm:px-4">
        <Link className="font-serif text-lg leading-none" href="/" aria-label="Home">
          Tim Sweeny
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} className="px-3 py-2 text-sm text-muted transition hover:text-ink" href={href}>
              {label}
            </Link>
          ))}
        </div>
        <Link className="inline-flex size-9 items-center justify-center border border-rule text-muted transition hover:text-ink" href="/search" aria-label="Search">
          <Search size={17} />
        </Link>
      </nav>
      <div className="mt-2 flex gap-1 overflow-x-auto md:hidden">
        {navItems.map(([label, href]) => (
          <Link key={href} className="shrink-0 border border-rule bg-paper px-3 py-2 text-sm text-muted" href={href}>
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
