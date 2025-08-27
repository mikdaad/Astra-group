"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Download, Share2, Star } from "lucide-react";

type MediaType = "photo" | "video";

// Minimal sample map; replace with real data source later
const sampleItems: Record<string, { title: string; userId: string; type: MediaType; image: string; description: string }>
  = {
    p1: { title: "John doe", userId: "AA0001", type: "photo", image: "/images/vehicles/car1.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    p2: { title: "John doe", userId: "AA0001", type: "photo", image: "/images/vehicles/bike1.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    v1: { title: "John doe", userId: "AA0001", type: "video", image: "/images/vehicles/car2.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  };

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const data = sampleItems[id] || sampleItems.p1;
  const [rating, setRating] = React.useState<number>(4);

  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid grid-cols-12 gap-6 rounded-3xl">
          {/* Left: Media */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              <div className="aspect-[4/3] sm:aspect-[16/12]">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-black/30">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="h-10 w-10 grid place-items-center rounded-full bg-black/50 border border-white/20 backdrop-blur">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details + Rating */}
          <div className="col-span-12 lg:col-span-6">
            <div className="rounded-3xl p-6 bg-gradient-to-b from-black/20 to-black/40 border border-white/10 min-h-[320px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{data.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{data.userId}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const idx = i + 1;
                    const active = rating >= idx;
                    return (
                      <button key={idx} onClick={() => setRating(idx)} aria-label={`rate ${idx}`}>
                        <Star className="w-5 h-5" strokeWidth={1.5} color="#F7B500" fill={active ? "#F7B500" : "transparent"} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-white/80 text-sm mt-6 leading-relaxed">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


