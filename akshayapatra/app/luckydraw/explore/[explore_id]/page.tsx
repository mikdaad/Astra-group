"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Star, Award } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { getSchemeTopRewards, getSchemePeriods, getSchemePeriodRewards } from "@/app/lib/rpc";

type RewardData = {
  id: string;
  title: string;
  description?: string;
  image: string;
  position: number;
  value?: number;
  schemeId: string;
};

export default function ExplorePage() {
  const params = useParams<{ explore_id: string }>();
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [reward, setReward] = useState<RewardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRewardData = async () => {
      if (!params.explore_id) {
        setError("Invalid reward ID");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Raw explore_id from params:", params.explore_id);
        const decodedExploreId = decodeURIComponent(params.explore_id);
        console.log("Decoded explore_id:", decodedExploreId);
        
        const res = await fetch('/api/cards');
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch card details.');
        }

        const card = json.cards.find((c: any) => c.scheme);
        if (!card || !card.scheme) {
          setError("No active scheme found");
          setIsLoading(false);
          return;
        }

        console.log("Selected card:", card);
        console.log("Scheme ID being used:", card.scheme_id);
        
        let rewards: any[] = [];
        try {
          rewards = await getSchemeTopRewards(card.scheme_id, supabase);
          console.log("All rewards:", rewards);
        } catch (error) {
          console.error("Error fetching rewards:", error);
          // Try alternative approach - get rewards from first period
          const periods = await getSchemePeriods(card.scheme_id, supabase);
          if (periods.length > 0) {
            const periodRewards = await getSchemePeriodRewards({ 
              schemeId: card.scheme_id, 
              periodIndex: periods[0].period_index 
            }, supabase);
            console.log("Period rewards as fallback:", periodRewards);
            rewards = periodRewards;
          } else {
            rewards = [];
          }
        }
        console.log("Looking for reward_id:", decodedExploreId);
        console.log("Available reward_ids:", rewards.map((r: any) => r.reward_id));
        console.log("First reward structure:", rewards[0]);
        let rewardData = rewards.find((r: any) => r.reward_id === decodedExploreId);
        
        // If not found, try to find by position as fallback
        if (!rewardData) {
          console.log("Reward not found by ID, trying to find by position...");
          const position = parseInt(decodedExploreId);
          if (!isNaN(position)) {
            rewardData = rewards.find((r: any) => r.position === position);
            console.log("Found by position:", rewardData);
          }
          
          // If still not found, try to find by title or any other field
          if (!rewardData) {
            console.log("Trying to find by title or other fields...");
            rewardData = rewards.find((r: any) => 
              r.title?.toLowerCase().includes(decodedExploreId.toLowerCase()) ||
              r.reward_id?.toLowerCase().includes(decodedExploreId.toLowerCase())
            );
            console.log("Found by other fields:", rewardData);
          }
        }
        
        if (!rewardData) {
          // If no reward found, create a default one based on the explore_id
          console.log("Creating default reward data");
          const position = parseInt(decodedExploreId) || 1;
          rewardData = {
            reward_id: decodedExploreId,
            title: `Prize #${position}`,
            description: "An exciting reward for participating in our gold & diamond investment program.",
            image_url: "/images/reward/reward1.png",
            position: position,
            value: 0
          };
        }

        const rewardInfo: RewardData = {
          id: rewardData.reward_id,
          title: rewardData.title || `Prize #${rewardData.position}`,
          description: rewardData.description || "An exciting reward for participating in our gold & diamond investment program.",
          image: rewardData.image_url || "/images/reward/reward1.png",
          position: rewardData.position,
          value: rewardData.value || 0,
          schemeId: card.scheme_id,
        };

        setReward(rewardInfo);
      } catch (err: any) {
        console.error("Failed to load reward data:", err);
        setError(err.message || "Failed to load reward details");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRewardData();
  }, [params.explore_id, supabase]);

  if (isLoading) {
    return (
      <main className="min-h-screen w-full text-white">
        <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>
        <div className="flex justify-center items-center h-64 text-white/70">
          <Loader2 className="w-8 h-8 animate-spin mr-3"/> Loading reward details...
        </div>
      </main>
    );
  }

  if (error || !reward) {
    return (
      <main className="min-h-screen w-full text-white">
        <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-5 text-center text-red-400">
          <p>{error || "Reward not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
      </div>

      <section className="mx-auto max-w-6xl px-5">
        {/* Hero Section */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600/20 to-amber-800/20 border border-white/10">
          <div className="relative h-64 md:h-80">
            <Image 
              src={reward.image} 
              alt={reward.title} 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-4">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">Prize #{reward.position}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{reward.title}</h1>
                {reward.value && reward.value > 0 && (
                  <p className="text-xl text-orange-400 font-semibold">₹{reward.value.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                About This Reward
              </h2>
              <p className="text-white/80 leading-relaxed">
                {reward.description}
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span>Must be an active participant in the investment program</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span>Payment must be completed before the reward distribution date</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span>Winner will be selected randomly</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span>Reward will be delivered within 30 days of winning</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prize Details */}
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Reward Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Position</span>
                  <span className="font-semibold">#{reward.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Type</span>
                  <span className="font-semibold">Reward</span>
                </div>
                {reward.value && reward.value > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Value</span>
                    <span className="font-semibold text-orange-400">₹{reward.value.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* How to Participate */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-600/20 to-amber-800/20 border border-orange-500/20 p-6">
              <h3 className="text-lg font-semibold mb-4">How to Participate</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-white/80">Select your preferred payment period</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-white/80">Complete the payment process</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-white/80">Wait for the draw results</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/luckydraw')}
                className="mt-4 w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Participate Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}
