"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const IconImg: React.FC<{ src: string; alt: string; active?: boolean; size?: number }> = ({ src, alt, active, size }) => (
  <img
    src={src}
    alt={alt}
    className={cn(
      "object-contain transition filter",
      // On hover, make the image white using filter tricks
      "group-hover:brightness-0 group-hover:invert",
      // When the route is active, keep it white
      active ? "brightness-0 invert" : ""
    )}
    style={{ width: size, height: size }}
  />
);

const items = [
  { href: "/", label: "Home", imgSrc: "/iconsvgs/home.svg", size: 24 },
  { href: "/luckydraw", label: "Rewards", imgSrc: "/iconsvgs/lucky.svg", size: 28 },
  { href: "/profile", label: "Profile", imgSrc: "/iconsvgs/profile.svg", size: 24 },
];


export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40">
      <div className="flex items-center justify-between rounded-2xl bg-[#1C0D07] border border-white/10 px-4 py-2 text-white">
        {items.map(({ href, label, imgSrc, size }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="group flex flex-col items-center gap-1 text-[10px]">
              <div
                className={cn(
                  "h-10 w-10 grid place-items-center rounded-full my-1",
                  active ? "bg-gradient-to-b from-orange-600 to-amber-800" : "bg-transparent"
                )}
              >
                <IconImg src={imgSrc} alt={label} active={active} size={size} />
              </div>
              
              
            </Link>
          );
        })}
      </div>
    </nav>
  );
}



