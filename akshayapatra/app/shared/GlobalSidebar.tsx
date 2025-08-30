"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, LogOut,LayoutDashboard, Home, TicketPercent, CreditCard, Wallet2, Calendar, History, Gift, Megaphone, Headphones, Trophy, IndianRupee, Users, UserCheck, UserPlus, User } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";

const iconClass = "w-6 h-6";

const IconImg: React.FC<{ src: string; alt: string; active?: boolean; size?: number }> = ({ src, alt, active, size = 36 }) => (
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

type RouteItem =
  | { href: string; label: string; icon: React.ReactNode; iconSrc?: undefined; iconAlt?: undefined; iconSize?: undefined }
  | { href: string; label: string; icon?: undefined; iconSrc: string; iconAlt: string; iconSize?: number };

const userRoutes: RouteItem[] = [
  { href: "/", label: "Home", iconSrc: "/iconsvgs/home.svg", iconAlt: "home", iconSize: 24 },
 
  { href: "/luckydraw", label: "Gold & Diamond Rewards", iconSrc: "/iconsvgs/luckydraw.svg", iconAlt: "rewards", iconSize: 30 },
  { href: "/transactionhistory", label: "Investment History", iconSrc: "/iconsvgs/transfers.svg", iconAlt: "history" },
  { href: "/support", label: "Support", iconSrc: "/iconsvgs/support.svg", iconAlt: "support", iconSize: 28 },
];

// Admin routes
const adminRoutes: RouteItem[] = [
  { href: "/admin", label: "Admin Dashboard", icon: <LayoutDashboard className={iconClass} /> },
  { href: "/admin/schemes", label: "Investment Plans", icon: <Trophy className={iconClass} /> },
  { href: "/admin/cards", label: "Investment Cards", icon: <CreditCard className={iconClass} /> },
  { href: "/admin/users", label: "Investors", icon: <Users className={iconClass} /> },
  { href: "/admin/income", label: "Income & Returns", icon: <IndianRupee className={iconClass} /> },
  { href: "/admin/winners", label: "Reward Winners", icon: <Gift className={iconClass} /> },
  { href: "/admin/staff", label: "Staff Management", icon: <UserPlus className={iconClass} /> },
  { href: "/admin/support", label: "Support Requests", icon: <Headphones className={iconClass} /> },
  { href: "/admin/profile", label: "Profile", icon: <User className={iconClass} /> },
];

const userBottomRoutes: RouteItem[] = [
    { href: "/privacy-policy", label: "Privacy Policy", icon: <TicketPercent className="w-6 h-6" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-6 h-6" /> },
    { href: "/logout", label: "Logout", icon: <LogOut className="w-6 h-6" /> },
  ];

const adminBottomRoutes: RouteItem[] = [
  { href: "/admin/settings", label: "Admin Settings", icon: <Settings className={iconClass} /> },
  { href: "/admin/logout", label: "Logout", icon: <LogOut className="w-6 h-6" /> },
];


export default function GlobalSidebar() {
  const pathname = usePathname();
  const { hasPermission, isRole, accessiblePages, role, loading } = useRBAC();
  const isAdminPage = pathname.startsWith('/admin');

  // Filter admin routes based on user permissions and role
  const getFilteredAdminRoutes = (): RouteItem[] => {
    if (!role || loading) return [];

    return adminRoutes.filter(route => {
      // Check if page is accessible
      if (!accessiblePages.includes(route.href)) {
        return false;
      }

      // Check minimum role requirement for staff management
      if (route.href === '/admin/staff') {
        const roleHierarchy: Record<string, number> = {
          new: 1,
          support: 2,
          manager: 3,
          admin: 4,
          superadmin: 5
        };

        const userLevel = roleHierarchy[role] || 0;
        const requiredLevel = roleHierarchy['superadmin'] || 0;

        if (userLevel < requiredLevel) {
          return false;
        }
      }

      // Check required permissions based on route
      const routePermissions: Record<string, string[]> = {
        '/admin': ['dashboard:view'],
        '/admin/schemes': ['schemes:view'],
        '/admin/cards': ['cards:view'],
        '/admin/users': ['users:view'],
        '/admin/income': ['income:view'],
        '/admin/staff': ['staff:view'],
        '/admin/winners': ['winners:view'],
        '/admin/support': ['support:view'],
        '/admin/profile': ['profile:view'],
        '/admin/settings': ['settings:view']
      };

      const requiredPerms = routePermissions[route.href];
      if (requiredPerms) {
        return requiredPerms.some(permission => hasPermission(permission));
      }

      return true;
    });
  };

  // Choose routes based on current page and user permissions
  const routes = isAdminPage ? getFilteredAdminRoutes() : userRoutes;
  const bottomRoutes = isAdminPage ? adminBottomRoutes : userBottomRoutes;

  const RenderPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-14 bg-black/90 rounded-[64px] p-2.5 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      {children}
    </div>
  );

  if (loading) {
    return (
      <aside className="fixed left-4 top-24 z-40 hidden md:block bg-transparent">
        <div className="flex flex-col items-center justify-between h-[calc(100vh-18rem)]">
          <RenderPill>
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-3xl bg-zinc-700 animate-pulse" />
              ))}
            </div>
          </RenderPill>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-4 top-24 z-40 hidden md:block bg-transparent">
      <div className="flex flex-col items-center justify-between h-[calc(100vh-18rem)]">
        <RenderPill>
          <nav className="flex flex-col gap-3">
            {routes.map((r) => {
              const active = pathname === r.href;
              return (
                <Link key={r.href} href={r.href} className="group">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-3xl grid place-items-center transition",
                      active
                        ? "bg-gradient-to-b from-orange-600 to-amber-800 text-white fill-white"
                        : "text-white/40 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {"iconSrc" in r && r.iconSrc ? (
                      <IconImg src={r.iconSrc} alt={r.iconAlt ?? "icon"} active={active} size={"iconSize" in r && r.iconSize ? r.iconSize : 24} />
                    ) : (
                      r.icon
                    )}
                  </div>
                  <span className="sr-only">{r.label}</span>
                </Link>
              );
            })}
          </nav>
        </RenderPill>

        {/* Bottom separated pill for settings/logout */}
        <RenderPill>
          <nav className="flex flex-col gap-3">
            {bottomRoutes.map((r) => {
              const active = pathname === r.href;
              return (
                <Link key={r.href} href={r.href} className="group">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-3xl grid place-items-center transition",
                      active
                        ? "bg-gradient-to-b from-orange-600 to-amber-800 text-white"
                        : "text-white/40 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {r.icon}
                  </div>
                  <span className="sr-only">{r.label}</span>
                </Link>
              );
            })}
          </nav>
        </RenderPill>
      </div>
    </aside>
  );
}


