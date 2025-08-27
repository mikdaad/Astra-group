import React from "react";
import Link from "next/link";
import Image from "next/image";

type Item = {
  href: string;
  label: string;
  iconPath: string;
};

const menuItems: Item[] = [
  { href: "/wallet", label: "Wallet", iconPath: "/iconsvgs/viewall/wallet.svg" },
  { href: "/installments", label: "Installments", iconPath: "/iconsvgs/viewall/installments.svg" },
  { href: "/transactionhistory", label: "Transaction History", iconPath: "/iconsvgs/viewall/transactionhistory.svg" },
  { href: "/winnerspage", label: "Winner’s List", iconPath: "/iconsvgs/viewall/trophy.svg" },
  { href: "/promoters", label: "Promoters", iconPath: "/iconsvgs/viewall/promoters.svg" },
  { href: "/rewards", label: "Rewards", iconPath: "/iconsvgs/viewall/rewards.svg" },
  { href: "/achievers", label: "Achiever’s", iconPath: "/iconsvgs/viewall/achievers.svg" },
  { href: "/commision", label: "Commissions", iconPath: "/iconsvgs/viewall/commissions.svg" },
  { href: "/brochure", label: "Brochure", iconPath: "/iconsvgs/viewall/brochure.svg" },

];

export default function ViewAllPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
      <div
        className="rounded-2xl text-white shadow-2xl  overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(75,28,8,0.95), rgba(43,18,7,0.95), rgba(25,10,5,0.95))",
        }}
      >
        {/* Profile card */}
        <div className="p-4">
          <div className="rounded-2xl p-3 bg-white/10 border border-white/15 flex items-center gap-3">
            <img
              src="/images/vehicles/car1.png"
              alt="avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">John doe</div>
              <div className="text-xs text-white/70">User ID : AA0001</div>
            </div>
          </div>
        </div>

        {/* Help tile */}
        <div className="px-4">
          <Link
            href="/support"
            className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 px-4 py-3"
          >
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
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-2xl bg-black border border-white/10 px-4 py-3"
            >
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
  );
}



