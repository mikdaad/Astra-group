"use client";

import React from "react";
import { Menu, ShoppingCart, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Item = { href: string; label: string; iconPath: string };

const menuItems: Item[] = [
  { href: "/about", label: "About", iconPath: "/iconsvgs/viewall/about.svg" },
  { href: "/transactionhistory", label: "Investment History", iconPath: "/iconsvgs/viewall/transactionhistory.svg" },
  { href: "/winnerspage", label: "Reward Winners", iconPath: "/iconsvgs/viewall/trophy.svg" },
  { href: "/rewards", label: "Gold & Diamond Rewards", iconPath: "/iconsvgs/viewall/rewards.svg" },
  { href: "/achievers", label: "Top Investors", iconPath: "/iconsvgs/viewall/achievers.svg" },
  { href: "/privacy-policy", label: "Privacy Policy", iconPath: "/iconsvgs/viewall/privacy.svg" },
  { href: "/settings", label: "Settings", iconPath: "/iconsvgs/viewall/settings.svg" },
];

export default function MobileHeader() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-gradient-to-b from-orange-700 to-amber-800 text-white">
        <div className="h-full px-3 flex items-center justify-between">
          <button
            aria-label="menu"
            className="h-10 w-10 grid place-items-center rounded-md bg-white/10"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-base font-semibold">Golden Diamond Investment</div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 grid place-items-center rounded-full bg-white/10"><ShoppingCart className="w-5 h-5" /></button>
            <button className="h-9 w-9 grid place-items-center rounded-full bg-white/10"><Bell className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 text-white overflow-y-auto"
               style={{ backgroundImage: 'linear-gradient(to bottom, #4b1c08, #2b1207, #190a05)' }}>
            {/* Profile card */}
            <div className="p-4">
              <div className="rounded-2xl p-3 bg-white/10 border border-white/15 flex items-center gap-3">
                <img src="/images/vehicles/car1.png" alt="avatar" className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">John doe</div>
                  <div className="text-xs text-white/70">User ID : AA0001</div>
                </div>
              </div>
            </div>

            {/* Help tile */}
            <div className="px-4">
              <Link href="/support" onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
                    <Image src="/iconsvgs/support.svg" alt="support" width={16} height={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">Need Help?</div>
                    <div className="text-[11px] text-white/70">Live chat support</div>
                  </div>
                </div>
                <Image src="/iconsvgs/chevronswipe.svg" alt="chevron" width={16} height={16} />
              </Link>
            </div>

            {/* Menu list */}
            <nav className="mt-3 space-y-3 px-4 pb-6">
              {menuItems.map(({ href, label, iconPath }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-black border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg  grid place-items-center">
                      <Image src={iconPath} alt={label} width={20} height={20} />
                    </div>
                    <div className="text-[13px] font-semibold">{label}</div>
                  </div>
                  <Image src="/iconsvgs/chevronswipe.svg" alt="chevron" width={20} height={20} />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}


