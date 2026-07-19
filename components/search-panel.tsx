"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentList } from "@/components/content-list";
import type { PublicListItem } from "@/lib/public-content";

export function SearchPanel({ items }: { items: PublicListItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div>
      <label className="flex items-center gap-3 border-b border-ink pb-3">
        <Search size={22} className="text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-2xl outline-none placeholder:text-muted sm:text-4xl"
          placeholder="Search projects, writing, reading, interests"
          autoFocus
        />
      </label>
      <p className="mt-3 text-sm text-muted">
        {results.length} of {items.length} items
      </p>
      <div className="mt-8">
        <ContentList items={results} />
      </div>
    </div>
  );
}
