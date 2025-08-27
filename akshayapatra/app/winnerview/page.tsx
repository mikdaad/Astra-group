"use client";

import React from "react";
import { Download, Share2 } from "lucide-react";

export default function WinnerViewPage() {
  const heroImage = "/images/vehicles/carwinner.jpg"; // place your image under public/images/winner/

  return (
    <main
      className="min-h-screen w-full text-white/90"
      style={{ backgroundImage: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-6">
        <h2 className="text-lg font-semibold">Winner</h2>

        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* Left: Winner image */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              <div className="aspect-[4/3] sm:aspect-[16/12]">
                <img src={heroImage} alt="Winner" className="w-full h-full object-cover" />
              </div>
              {/* Action buttons */}
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

          {/* Right: Winner details */}
          <div className="col-span-12 lg:col-span-6">
            <div className="rounded-3xl p-6 bg-gradient-to-b from-black/20 to-black/40 border border-white/10">
              <div className="text-center lg:text-left">
                <div className="mb-3 inline-flex px-4 py-1 rounded-full bg-white/10 text-[12px]">1st Draw Winner</div>
                <h3 className="text-2xl font-semibold leading-tight">John doe</h3>
                <p className="text-white/80 text-sm mt-1">AA0001</p>

                <p className="text-white/90 mt-6 font-medium">Huyndai Creta</p>
                <p className="text-white/70 text-sm mt-2">
                  We’re thrilled to announce that John Doe has been chosen as the Car of the Month January winner for his stunning Hyundai
                  Creta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


