"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Share2, Download, MapPin, Camera } from "lucide-react";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const heroImage = "/images/events/hall.jpg"; // place your image under public/images/events/

  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-[28px] bg-gradient-to-b from-black/15 to-black/35 border border-white/10 p-6 lg:p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: image with status and actions */}
            <div className="col-span-12 md:col-span-6">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-white/10 text-[12px]">Ongoing</div>
                </div>
                <div className="aspect-[4/3] sm:aspect-[16/12]">
                  <img src={heroImage} alt="Event" className="w-full h-full object-cover" />
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

            {/* Right: details */}
            <div className="col-span-12 md:col-span-6 flex items-center">
              <div className="w-full">
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span>26 Jan 2025</span>
                  <span className="opacity-40">|</span>
                  <span>10:00 AM – 01:00 PM</span>
                </div>
                <h1 className="mt-4 text-2xl sm:text-3xl font-semibold">Convention Hall</h1>
                <p className="mt-2 text-white/80 text-sm">Mangaluru, Karnataka Lorem ipsum dolor sit amet, adipiscing elit.</p>
                <p className="mt-5 text-white/70 text-sm leading-relaxed max-w-xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. Ut enim ad minim veniam,
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-black/30">
                    <Camera className="w-5 h-5" />
                  </button>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-black/30">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/60 text-xs mt-1">Event id: {id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



