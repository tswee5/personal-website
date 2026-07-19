export function ProjectVisual({ title }: { title: string }) {
  return (
    <div className="grid aspect-[16/9] place-items-center border border-rule bg-wash">
      <div className="w-3/4 border-y border-ink py-8 text-center">
        <p className="font-serif text-3xl">{title}</p>
        <p className="mt-2 text-sm text-muted">system sketch</p>
      </div>
    </div>
  );
}
