import Image from "next/image";

const DEFAULT_COVERS = [
  "/brand/cover-floating.png",
  "/brand/cover-blocks.png",
  "/brand/cover-confetti.png",
  "/brand/cover-glow.png"
];

// Same event always gets the same cover (stable across reloads), different
// events spread across the 4 designs so pages don't all look identical
// while nobody's uploaded a real photo yet.
function pickDefaultCover(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length];
}

export function EventCoverBanner({ seed }: { seed: string }) {
  return (
    <div className="relative h-40 w-full overflow-hidden bg-paper sm:h-52 md:h-64">
      <Image
        src={pickDefaultCover(seed)}
        alt=""
        fill
        priority
        unoptimized
        className="object-cover"
      />
    </div>
  );
}
