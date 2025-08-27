"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Play } from "lucide-react";

type MediaType = "photo" | "video";
type ReviewItem = {
  id: string;
  type: MediaType;
  title: string;
  image: string; // thumbnail or image
  src?: string; // video src if type === 'video'
};

const heroItems: ReviewItem[] = [
  { id: "h1", type: "video", title: "Team Meeting", image: "/images/vehicles/car3.png" },
  { id: "h2", type: "photo", title: "Workspace", image: "/images/vehicles/bike1.png" },
  { id: "h3", type: "photo", title: "Happy Clients", image: "/images/vehicles/car1.png" },
  { id: "h4", type: "photo", title: "Coffee Break", image: "/images/vehicles/car2.png" },
  { id: "h5", type: "video", title: "Celebration", image: "/images/vehicles/bike2.png" },
];

const photos: ReviewItem[] = [
  { id: "p1", type: "photo", title: "John Doe", image: "/images/vehicles/mobile1.png" },
  { id: "p2", type: "photo", title: "John Doe", image: "/images/vehicles/car1.png" },
  { id: "p3", type: "photo", title: "John Doe", image: "/images/vehicles/car2.png" },
  { id: "p4", type: "photo", title: "John Doe", image: "/images/vehicles/car3.png" },
  { id: "p5", type: "photo", title: "John Doe", image: "/images/vehicles/bike1.png" },
  { id: "p6", type: "photo", title: "John Doe", image: "/images/vehicles/bike2.png" },
];

const videos: ReviewItem[] = [
  { id: "v1", type: "video", title: "John Doe", image: "/images/vehicles/car1.png" },
  { id: "v2", type: "video", title: "John Doe", image: "/images/vehicles/car2.png" },
  { id: "v3", type: "video", title: "John Doe", image: "/images/vehicles/car3.png" },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function TopTabs() {
  const pathname = usePathname();
  const items = [
    { label: "Recommend", href: "/winnerspage" },
    { label: "Winner", href: "/winnerspage/winner" },
    { label: "Review", href: "/winnerspage/review" },
    { label: "Events", href: "/winnerspage/events" },
    { label: "Video", href: "/winnerspage/video" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5">
      <div className="inline-flex rounded-2xl bg-black/20 border border-white/10 p-1">
        {items.map((t) => {
          const active = pathname === t.href || (t.href === "/winnerspage/review" && pathname === "/winnerspage/review");
          return (
            <Link key={t.href} href={t.href} className={classNames("px-4 sm:px-5 py-2 text-sm rounded-xl transition", active ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5")}>{t.label}</Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroCard({ item, onOpen }: { item: ReviewItem; onOpen: (it: ReviewItem) => void }) {
  return (
    <div className="relative w-[clamp(280px,48vw,720px)] h-[clamp(160px,28vw,260px)] rounded-2xl overflow-hidden">
      <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      {item.type === "video" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-10 w-10 rounded-full bg-black/50 backdrop-blur grid place-items-center">
            <Play className="w-5 h-5" />
          </div>
        </div>
      )}
      <button onClick={() => onOpen(item)} className="absolute inset-0" aria-label="open" />
    </div>
  );
}

export default function ReviewPage() {
  const [filter, setFilter] = React.useState<MediaType | "all">("all");
  const [index, setIndex] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<ReviewItem | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);

  const filteredHero = React.useMemo(() => {
    if (filter === "all") return heroItems;
    return heroItems.filter((h) => h.type === filter);
  }, [filter]);

  const loopIndex = (n: number) => (n + filteredHero.length) % filteredHero.length;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 80;
    if (info.offset.x < -threshold) setIndex((i) => loopIndex(i + 1));
    if (info.offset.x > threshold) setIndex((i) => loopIndex(i - 1));
  };

  const openItem = (it: ReviewItem) => setLightbox(it);
  const close = () => setLightbox(null);

  const showPhotos = filter === "all" || filter === "photo";
  const showVideos = filter === "all" || filter === "video";

  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="h-4" />
      <TopTabs />

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-5 mt-5 flex items-center gap-2">
        {(["all", "photo", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              "px-4 py-1.5 rounded-full text-sm",
              filter === f ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            )}
          >
            {f === "all" ? "All" : f === "photo" ? "Photo" : "Video"}
          </button>
        ))}
      </div>

      {/* Swipeable hero row */}
      <section className="mt-6">
        <div className="mx-auto max-w-7xl px-5">
          {filteredHero.length > 0 && (
            <div className="relative h-[clamp(200px,32vw,300px)] flex items-center justify-center">
              {/* Ghost cards left/right */}
              {[...Array(1)].map((_, offset) => {
                const leftIdx = loopIndex(index - (offset + 1));
                const rightIdx = loopIndex(index + (offset + 1));
                return (
                  <React.Fragment key={offset}>
                    <div className="absolute left-[6%] top-1/2 -translate-y-1/2 scale-[0.92] opacity-70 blur-sm">
                      <HeroCard item={filteredHero[leftIdx]} onOpen={openItem} />
                    </div>
                    <div className="absolute right-[6%] top-1/2 -translate-y-1/2 scale-[0.92] opacity-70 blur-sm">
                      <HeroCard item={filteredHero[rightIdx]} onOpen={openItem} />
                    </div>
                  </React.Fragment>
                );
              })}
              {/* Active */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={filteredHero[index].id}
                  drag="x"
                  style={{ x, rotate, scale }}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <HeroCard item={filteredHero[index]} onOpen={openItem} />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Photos grid */}
      {showPhotos && (
        <section className="mt-8">
          <div className="mx-auto max-w-7xl px-5">
            <h3 className="text-white font-semibold mb-4">Photo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {photos.map((p) => (
                <Link key={p.id} href={`/winnerspage/review/${p.id}`} className="text-left">
                  <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <div className="aspect-[5/6]">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-white/60">Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos grid */}
      {showVideos && (
        <section className="mt-10">
          <div className="mx-auto max-w-7xl px-5">
            <h3 className="text-white font-semibold mb-4">Video</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <Link key={v.id} href={`/winnerspage/review/${v.id}`} className="text-left">
                  <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                    <div className="aspect-video">
                      <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-10 w-10 rounded-full bg-black/50 backdrop-blur grid place-items-center">
                        <Play className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{v.title}</p>
                    <p className="text-xs text-white/60">Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox removed; we route to detail pages now */}

      <div className="h-12" />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
