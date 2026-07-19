import { ContentList } from "@/components/content-list";
import { getRelated, type Relationship } from "@/lib/content";

export function RelatedContent({ related }: { related: Relationship[] }) {
  const items = getRelated(related);

  if (!items.length) {
    return null;
  }

  return (
    <aside className="mt-14">
      <h2 className="mb-4 font-serif text-2xl font-normal">Related</h2>
      <ContentList items={items} />
    </aside>
  );
}
