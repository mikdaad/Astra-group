"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, User2, KeyRound, Languages, ShieldCheck, MapPin, Users, LogOut, Trash2, Settings } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

type UserProfileRow = {
  full_name?: string | null;
  user_code?: string | null;
  profile_image_url?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [displayName, setDisplayName] = useState<string>("John doe");
  const [userCode, setUserCode] = useState<string>("AA0001");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user || !mounted) return;

      // Try fetch profile details
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, user_code, profile_image_url")
        .eq("id", user.id)
        .maybeSingle<UserProfileRow>();

      const safeName = profile?.full_name || (user.user_metadata?.full_name as string | undefined) || user.email || "User";
      const safeCode = profile?.user_code || (user.id?.slice(0, 6).toUpperCase() ?? "");

      if (mounted) {
        setDisplayName(safeName);
        setUserCode(safeCode ? `AA${safeCode}` : "AA0001");
        setAvatarUrl(profile?.profile_image_url || null);
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!ok) return;
    // This action typically requires a privileged server function.
    // For now, route to support page.
    router.push("/support");
  };

  return (
    <div className="min-h-[100dvh] text-white">
      {/* Page header */}
      <div className="pt-6 pb-4 text-center">
        <div className="text-lg font-semibold">Profile</div>
      </div>

      {/* Profile card */}
      <div className="px-4">
        <div className="mx-auto w-full max-w-md rounded-3xl p-6 text-center  ">
          <div className="mx-auto h-24 w-24 rounded-full overflow-hidden ring-2 ring-white/15">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/vehicles/car1.png" alt="avatar" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="mt-4 text-xl font-semibold">{displayName}</div>
          <div className="text-sm text-white">User ID : {userCode}</div>
        </div>
      </div>

      {/* Menu list */}
      <div className="mt-5 space-y-3 px-4 pb-8 max-w-md mx-auto">
        <MenuItem href="/account" label="My Account" Icon={User2} />
        <MenuItem href="/settings/security" label="Change Transaction PIN" Icon={KeyRound} />
        <MenuItem href="/settings" label="Language" Icon={Languages} />
        <MenuItem href="/settings" label="KYC" Icon={ShieldCheck} />
        <MenuItem href="/settings" label="Setting" Icon={Settings} />
        <MenuItem href="/settings" label="Location" Icon={MapPin} />
        <MenuItem href="/support" label="Contact List" Icon={Users} />

        {/* Logout (button style) */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between rounded-2xl bg-black/70 border border-white/10 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold">Logout</div>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Delete account destructive */}
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-between rounded-2xl bg-black/70 border border-white/10 px-4 py-3"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-[13px] font-semibold text-red-500">Delete Account</div>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MenuItem({ href, label, Icon }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-black/70 border border-white/10 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-[13px] font-semibold">{label}</div>
      </div>
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}


