import { SearchPanel } from "@/components/search-panel";
import { getSearchItems } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const items = await getSearchItems();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="mb-10 font-serif text-6xl font-normal leading-none sm:text-7xl">Search</h1>
      <SearchPanel items={items} />
    </main>
  );
}
