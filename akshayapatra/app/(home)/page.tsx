"use client";

import React, { useEffect, useState, useMemo, useId } from "react";
import { BankAccountCard } from "@/app/components/card/bankaccountcard";
import { Button } from "@/components/ui/button";
import { Borderlesscard, CardContent, Card } from "@/components/ui/card";
import { ArrowRightLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { sb as fallbackSupabaseClient } from "@/app/lib/rpc";
import { useDirtyFlags } from "@/app/hooks/useDirtyFlags";
import { useLocalReferral } from "@/app/hooks/useLocalReferral";
import { ls } from "@/lib/local";
import type { DashboardStats, TeamTxRow, SchemeSummary, DownlinePaymentRow } from "@/app/lib/rpc";
import { getUserDashboardStats, issueCard, getTeamTransactionsPage, getDownlinePaymentsCurrentPeriod } from "@/app/lib/rpc";
import { profileSetupStorage } from "@/utils/storage/profileStorage";

// shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PaymentSuccessPopup, type PaymentReceiptData } from "@/app/components/payment/PaymentSuccessPopup";


const colorPalettes = [
  // Original Orange - matches the original card design  
  { paint0: "#2A0E16", paint1: "#EE6200", paint2: "#EE6200", paint3: "#EE6200", paint4: "#CA5002", paint5: "#1C0D07" },
  // Deep Blue - navy and ocean blues
  { paint0: "#1F2A44", paint1: "#4A90E2", paint2: "#357ABD", paint3: "#357ABD", paint4: "#2C5AA0", paint5: "#141E34" },
  // Golden Bronze - warm golds and browns  
  { paint0: "#47340E", paint1: "#FFB347", paint2: "#E6A035", paint3: "#E6A035", paint4: "#CC8A00", paint5: "#2A1D09" },
  // Emerald Green - rich greens
  { paint0: "#0C3D1E", paint1: "#50C878", paint2: "#40A368", paint3: "#40A368", paint4: "#2E7D32", paint5: "#0F3F20" },
  // Royal Purple - deep purples
  { paint0: "#2D1B38", paint1: "#9C27B0", paint2: "#8E24AA", paint3: "#8E24AA", paint4: "#7B1FA2", paint5: "#1A0E2E" },
  
];
function formatINR(n: number | string | null | undefined) {
  const num = Number(n ?? 0) || 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
}

type PaymentOption = "upi_onetime" | "upi_mandate";

export default function DashboardPage() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const tabOptions = [
    { id: "overview", label: "Overview" },
    { id: "segmented", label: "Segmented" },
    { id: "lead-funnel", label: "Lead Funnel" },
    { id: "team", label: "Team" },
    { id: "account", label: "Account" },
  ];
  const router = useRouter();
  const supabase = createSupabaseClient();
  const { flags, acknowledge } = useDirtyFlags();
  const referral = useLocalReferral();

  type UserCard = {
    id: string;
    cardholder_name?: string | null;
    phone_number?: string | null;
    total_wallet_balance?: number | string | null;
    commission_wallet_balance?: number | string | null;
  };
  const [cards, setCards] = useState<UserCard[]>(() => ls.get<UserCard[]>("app:cardsCache", []));
  const [cardsLoading, setCardsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(() => ls.get<DashboardStats | null>("app:dashboardStatsCache", null));
  const [statsLoading, setStatsLoading] = useState(false);
  const [teamTx, setTeamTx] = useState<TeamTxRow[]>(() => ls.get<TeamTxRow[]>("app:teamTxCache", []));
  const [downlinePayments, setDownlinePayments] = useState<DownlinePaymentRow[]>(() => ls.get<DownlinePaymentRow[]>("app:downlinePaymentsCache", []));
  const [downlinePaymentsLoading, setDownlinePaymentsLoading] = useState(false);
  const [selectedSchemeForPayments, setSelectedSchemeForPayments] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'error'>('checking');

  // ---- NEW: Schemes + payment UI state for the dialog
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("upi_onetime");
  const [issueError, setIssueError] = useState<string>("");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData | null>(null);

  async function loadCards() {
    try {
      setCardsLoading(true);
      const res = await fetch("/api/cards?limit=20", { credentials: "include", cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as { cards?: UserCard[] };
      const list = Array.isArray(json?.cards) ? (json.cards as UserCard[]) : [];
      setCards(list);
      ls.set("app:cardsCache", list);
    } finally {
      setCardsLoading(false);
    }
  }

  async function loadStats() {
    try {
      setStatsLoading(true);

      // 1. Get the current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("loadStats: No user is logged in.");
        setStats(null);
        return;
      }

      // 2. Call the RPC function WITH the user's ID
      const data = await getUserDashboardStats({ userId: user.id }, supabase);
      console.log('data', data);

      // Note: The RPC helper returns an array, so we take the first element
      const row = Array.isArray(data) ? data[0] ?? null : null;
      setStats(row);
      ls.set("app:dashboardStatsCache", row);

    } catch (error) {
        console.error("Failed to load stats:", error);
        setStats(null); // Clear stats on error
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadTeamTx() {
    try {
      const rows = await getTeamTransactionsPage({ levels: [1, 2], onlyCompleted: true, limit: 20 }, supabase);
      setTeamTx(rows);
      ls.set("app:teamTxCache", rows);
    } finally {
      // no loader in UI, but you can add if you want
    }
  }

  async function loadUserSchemes(): Promise<string | null> {
    try {
      setAuthStatus('checking');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        setAuthStatus('error');
        return null;
      }
      if (!user) {
        console.log('No user logged in');
        setAuthStatus('error');
        return null;
      }
      
      console.log('Loading schemes for user:', user.id);
      
      // Check authentication session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        setAuthStatus('error');
        return null;
      }
      if (!session) {
        console.warn('No active session - user may need to re-authenticate');
        setAuthStatus('error');
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          setAuthStatus('error');
          return null;
        }
        console.log('Session refreshed successfully');
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('authenticated');
      }
      
      // Test basic database connectivity with better error handling
      let workingClient = supabase;
      const { data: testQuery, error: testError } = await supabase
        .from("cards")
        .select("count")
        .limit(1);
      
      console.log('Database connectivity test:', testQuery, testError);
      if (testError) {
        console.error('Database connectivity failed:', testError);
        if (testError.message?.includes('No API key') || testError.message?.includes('401')) {
          console.error('API key issue detected - trying fallback client');
          // Try fallback client from RPC
          const { data: fallbackTest, error: fallbackError } = await fallbackSupabaseClient
            .from("cards")
            .select("count")
            .limit(1);
          
          console.log('Fallback client test:', fallbackTest, fallbackError);
          if (!fallbackError) {
            console.log('Fallback client works - using it');
            workingClient = fallbackSupabaseClient;
          } else {
            console.error('Both clients failed - this is a configuration issue');
            return null;
          }
        }
      }
      
      // First, let's check if the user exists in user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, initial_scheme_id")
        .eq("id", user.id)
        .single();
      
      console.log('User profile:', userProfile);
      if (profileError) {
        console.log('Profile error:', profileError);
        if (profileError.code === '42501' || profileError.message?.includes('permission denied')) {
          console.error('Permission denied - RLS policy may be blocking access');
          return null;
        }
      }
      
      // Get ALL user's cards first (without filtering by scheme_id)
      const { data: allUserCards, error: allCardsError } = await supabase
        .from("cards")
        .select("id, scheme_id, subscription_status, cardholder_name, created_at")
        .eq("user_id", user.id);
      
      console.log('All user cards (unfiltered):', allUserCards);
      if (allCardsError) {
        console.log('All cards error:', allCardsError);
        if (allCardsError.message?.includes('No API key') || allCardsError.message?.includes('401')) {
          console.error('Authentication issue when fetching cards - user may need to log in again');
          // Try to redirect to login or show auth error
          return null;
        }
      }
      
      // If we got null but no error, it might be an RLS issue
      if (allUserCards === null && !allCardsError) {
        console.warn('Got null cards with no error - this might be an RLS policy issue');
        // Try a different approach - check if ANY cards exist for this user
        const { count, error: countError } = await supabase
          .from("cards")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        console.log('Card count for user:', count, countError);
        return null;
      }
      
      // Now filter for cards with scheme_id
      const userCards = allUserCards?.filter(card => card.scheme_id) || [];
      console.log('User cards with scheme_id:', userCards);
      
      if (!userCards || userCards.length === 0) {
        console.log('User has no cards with schemes');
        
        // If user has cards but no scheme_id, that's a data issue
        if (allUserCards && allUserCards.length > 0) {
          console.warn('User has cards but they lack scheme_id:', allUserCards);
          return null;
        }
        
        console.log('User has no cards at all');
        return null;
      }
      
      // Get unique scheme IDs
      const userSchemeIds = [...new Set(userCards.map(card => card.scheme_id).filter(Boolean))];
      console.log('User scheme IDs from cards:', userSchemeIds);
      
      // Fetch all schemes
      const res = await fetch("/api/schemes", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        console.error('Failed to fetch schemes, status:', res.status, res.statusText);
        return null;
      }
      
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; schemes?: SchemeSummary[] };
      const allSchemes = Array.isArray(json?.schemes) ? (json.schemes as SchemeSummary[]) : [];
      console.log('All available schemes:', allSchemes);
      
      // Filter to only schemes the user has cards for, and exclude reg_fee
      const userSchemes = allSchemes.filter(scheme => 
        userSchemeIds.includes(scheme.id) &&
        !scheme.name.toLowerCase().includes('reg_fee') && 
        !scheme.name.toLowerCase().includes('registration')
      );
      
      console.log('User schemes (filtered):', userSchemes);
      setSchemes(userSchemes);
      
      // Select the first available scheme
      if (userSchemes.length > 0) {
        const firstSchemeId = userSchemes[0].id;
        setSelectedSchemeForPayments(firstSchemeId);
        console.log('Auto-selected scheme:', firstSchemeId, userSchemes[0].name);
        return firstSchemeId;
      }
      
      console.log('No valid schemes found for user');
      return null;
      
    } catch (e) {
      console.error("Failed to load user schemes:", e);
      return null;
    }
  }

  async function loadDownlinePayments(explicitSchemeId?: string) {
    try {
      setDownlinePaymentsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("loadDownlinePayments: No user is logged in.");
        setDownlinePayments([]);
        return;
      }

      console.log('Loading downline payments for user:', user.id);
      
      // Use explicit scheme ID or the currently selected scheme
      const schemeId = explicitSchemeId || selectedSchemeForPayments;

      if (!schemeId) {
        console.warn("loadDownlinePayments: No scheme provided or selected.");
        setDownlinePayments([]);
        return;
      }

      console.log('Using scheme ID:', schemeId);

      // Check if the user has any L1 referrals at all
      const { data: l1Cards, error: l1Error } = await supabase
        .from('cards')
        .select('id, cardholder_name, scheme_id, subscription_status, ref_l1_user_id')
        .eq('ref_l1_user_id', user.id)
        .limit(10);
      
      console.log('User L1 referral cards (all schemes):', l1Cards);
      if (l1Error) console.error('Error fetching L1 cards:', l1Error);
      
      // Also check L1 cards for the specific scheme
      const l1CardsForScheme = l1Cards?.filter(card => card.scheme_id === schemeId) || [];
      console.log(`L1 referral cards for scheme ${schemeId}:`, l1CardsForScheme);

      console.log('Calling getDownlinePaymentsCurrentPeriod with:', {
        userId: user.id,
        schemeId,
        page: 1
      });

      const rows = await getDownlinePaymentsCurrentPeriod({
        userId: user.id,
        schemeId,
        page: 1
      }, supabase);
      
      console.log('Downline payments result:', rows);
      
      setDownlinePayments(rows);
      ls.set("app:downlinePaymentsCache", rows);
    } catch (error) {
      console.error("Failed to load downline payments:", error);
      setDownlinePayments([]);
    } finally {
      setDownlinePaymentsLoading(false);
    }
  }

  useEffect(() => {
    // On first mount, ensure we cache referral if present
    referral.get();
    void loadCards();
    void loadStats();
    void loadTeamTx();
    
    // Load user's schemes first, then load downline payments
    (async () => {
      const selectedScheme = await loadUserSchemes();
      if (selectedScheme) {
        // Now load downline payments with the selected scheme directly
        await loadDownlinePayments(selectedScheme);
      } else {
        console.log('No schemes found for user - they need to issue a card first');
        setDownlinePayments([]);
      }
    })();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for payment success callback
  useEffect(() => {
    const checkPaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      
      if (paymentStatus === 'success') {
        try {
          // Get user data for receipt
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Extract user information
            const userName = 
              (user.user_metadata?.full_name as string) ||
              (user.user_metadata?.name as string) ||
              (user.email?.split('@')[0] as string) ||
              'User';
            
            const userPhone = user.phone || user.user_metadata?.phone_number || '';
            
            // Get scheme name from recently selected scheme
            const recentScheme = schemes.find(s => s.id === selectedScheme);
            const schemeName = recentScheme?.name || 'Card Issue';
            
            // Get transaction ID from URL or generate one
            const transactionId = `CARD${Date.now()}`;
            
            // Create receipt for card issue payment
            const receipt: PaymentReceiptData = {
              transactionId: transactionId,
              amount: selectedAmount,
              paymentType: 'card_issue',
              schemeName: schemeName,
              timestamp: new Date().toISOString(),
              userName: userName,
              userPhone: userPhone,
              paymentMethod: 'UPI',
              status: 'Success',
              description: 'Card Issue Payment'
            };
            
            // Show payment success popup
            setPaymentReceipt(receipt);
            setShowPaymentSuccess(true);
            
            // Clean URL to remove payment parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            // Refresh data to show the new card
            setTimeout(() => {
              void loadCards();
              void loadStats();
            }, 1000);
          }
        } catch (error) {
          console.error('Error handling payment success:', error);
        }
      } else if (paymentStatus === 'failed') {
        // Handle payment failure
        console.log('Card issue payment failed');
        
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };
    
    checkPaymentCallback();
  }, [supabase, schemes, selectedScheme, selectedAmount]);

  useEffect(() => {
    const needCards = !!flags.transactions;
    const needStats = flags.transactions || flags.referral || flags.referral2;
    if (!needCards && !needStats) return;
    (async () => {
      await Promise.all([
        needCards ? loadCards() : Promise.resolve(),
        needStats ? loadStats() : Promise.resolve(),
        needStats ? loadTeamTx() : Promise.resolve(),
        needStats ? loadDownlinePayments() : Promise.resolve(),
      ]);
      await acknowledge();
    })();
  }, [flags, acknowledge]);

  // ---- NEW: open issue dialog and fetch schemes
  const openIssueDialog = async () => {
    setIssueError("");
    setSchemesLoading(true);
    setIssueOpen(true);
    try {
      console.log("Fetching schemes from /api/schemes...");
      const res = await fetch("/api/schemes", { credentials: "include", cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; schemes?: SchemeSummary[] };
      console.log("Schemes API response:", json);
      
      const rows = Array.isArray(json?.schemes) ? (json.schemes as SchemeSummary[]) : [];
      console.log("Parsed schemes:", rows);
      
      // Filter out registration fee schemes
      const filteredSchemes = rows.filter(scheme => 
        !scheme.name.toLowerCase().includes('reg_fee') && 
        !scheme.name.toLowerCase().includes('registration')
      );
      
      if (filteredSchemes.length === 0) {
        setIssueError("No schemes available. Please contact support.");
        return;
      }
      
      setSchemes(filteredSchemes);
      // Try to default select previously selected scheme from storage
      let defaultSelected: string | undefined;
      try {
        const { userProfileStorage } = await import("@/utils/storage/profileStorage");
        defaultSelected = userProfileStorage.getProfile()?.initial_scheme_id;
      } catch {}
      
      const schemeToSelect = defaultSelected || filteredSchemes[0]?.id || "";
      const selectedSchemeData = filteredSchemes.find(s => s.id === schemeToSelect) || filteredSchemes[0];
      
      console.log("Scheme to select:", schemeToSelect);
      console.log("Selected scheme data:", selectedSchemeData);
      
      setSelectedScheme(schemeToSelect);
      setSelectedAmount(selectedSchemeData?.subscription_amount || 0);
      
      // Also set this as the selected scheme for payments tracking
      setSelectedSchemeForPayments(schemeToSelect);
      
      console.log("Final selectedScheme:", schemeToSelect, "selectedAmount:", selectedSchemeData?.subscription_amount);
    } catch (e) {
      console.error("Failed to load schemes:", e);
      setIssueError("Failed to load schemes. Please try again.");
    } finally {
      setSchemesLoading(false);
    }
  };

  // ---- UPDATED: Issue Card flow using selected scheme + payment option
  async function handleIssueConfirm() {
    setIssueError("");
    if (!selectedScheme) {
      setIssueError("Please select a scheme.");
      return;
    }

    setIsIssuing(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) {
        setIssueError("Please sign in again to issue a card.");
        return;
      }
      const userId = userData.user.id;

      // Persist selection locally so the rest of app can read it
      try {
        const { userProfileStorage } = await import("@/utils/storage/profileStorage");
        userProfileStorage.updateProfile({ initial_scheme_id: selectedScheme });
      } catch {}

      // 1) Issue card for chosen scheme first
      console.log("Issuing card for scheme:", selectedScheme);
      const newCardId = await issueCard(
        {
          userId,
          schemeId: selectedScheme,
          paymentMethod: paymentOption, // "upi_onetime" or "upi_mandate"
          setAsCommissionDestination: false,
          cardholderName: null,
          phone: null,
        },
        supabase
      );
      console.log("Card issued successfully with ID:", newCardId);

      // 2) Wait a moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3) Verify the card was created properly
      const { data: cardCheck, error: cardCheckErr } = await supabase
        .from("cards")
        .select("id, subscription_status, scheme_id")
        .eq("id", newCardId)
        .single();

      if (cardCheckErr || !cardCheck) {
        console.error("Failed to verify card creation:", cardCheckErr);
        setIssueError("Card was created but verification failed. Please try again.");
        return;
      }
      console.log("Card verification successful:", cardCheck);

      // 4) Validate amount before payment
      if (!selectedAmount || selectedAmount <= 0) {
        console.error("Invalid amount for payment:", selectedAmount);
        setIssueError("Invalid payment amount. Please select a valid scheme.");
        return;
      }

      // 5) Start payment session for registration payment (no cardId needed for new cards)
      console.log("Starting payment for amount:", selectedAmount);
      const res = await fetch("/api/initiatepayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: selectedAmount,
          // For new card registration, we don't pass cardId, schemeId, or periodIndex
          // The API will use the registration payment flow and should find our new card
        }),
      });

      if (!res.ok) {
        console.error("Payment API failed with status:", res.status);
        const errorText = await res.text().catch(() => "Unknown error");
        console.error("Payment API error response:", errorText);
        setIssueError(`Payment failed: ${res.status} ${res.statusText}`);
        return;
      }

      const json = await res.json().catch(() => ({}));
      console.log("Payment API response:", json);
      
      if (!json?.redirectUrl) {
        console.error("No redirectUrl in payment response:", json);
        setIssueError(json?.message || "Failed to start payment. Please try again.");
        return;
      }

      // Close dialog and go to payment
      setIssueOpen(false);
      window.location.assign(json.redirectUrl as string);
    } catch (e: any) {
      console.error("Issue card failed:", e);
      setIssueError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setIsIssuing(false);
    }
  }

  function handleIssueCardClick() {
    // Open the selection dialog instead of issuing immediately
    void openIssueDialog();
  }

  // ... existing code ...

  return (
    <div className="space-y-6 overflow-x-hidden no-scrollbar hide-scrollbar-mobile">
      {/* Tabs */}
      <div className="lg:mt-0 mt-2 w-full sm:w-[523px] h-9 mb-6 sm:mb-8 bg-white rounded-2xl p-1 flex items-center gap-1 overflow-x-auto no-scrollbar hide-scrollbar-mobile">
        {tabOptions.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            className={
              activeTab === tab.id
                ? "h-7 bg-gradient-to-b from-orange-600 to-amber-800 text-white hover:opacity-90"
                : "h-7 text-orange-600 hover:bg-gray-100"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
             </div>

      

       {/* Top: 3 Cards + Donut with "+" */}
      <section>
        <div className="grid grid-cols-12 gap-4 ">
          {/* Cards area */}
          <div
            className="
              col-span-12 lg:col-span-9
              flex overflow-x-auto overflow-y-visible
              snap-x snap-mandatory scroll-smooth
              md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible
              gap-0 md:gap-4
              scroll-px-4
              pb-6
              no-scrollbar hide-scrollbar-mobile hscroll-gutter
              [&>div]:shrink-0
              [&>div]:snap-start
              [&>div]:w-[88%]
              sm:[&>div]:w-[82%]
              md:[&>div]:w-auto

            "
          >
            {cards.length > 0 ? (
              cards.map((c, idx) => (
                <div key={c.id} className="relative p-0 bg-transparent shrink-0 w-full snap-center md:w-auto">
                  <BankAccountCard
                    userName={c.cardholder_name || "My Card"}
                    balance={formatINR(Number(c.total_wallet_balance) + Number(c.commission_wallet_balance))}
                    phoneNumber={c.phone_number || ""}
                    userId={c.id}
                    fillColors={colorPalettes[idx % colorPalettes.length]}
                  />

                  {idx === cards.length - 1 && (
                    <button
                      aria-label="Issue new card"
                      disabled={isIssuing}
                      onClick={handleIssueCardClick}
                      className="absolute top-1/2 -translate-y-1/2 right-3 md:-right-3 h-10 w-10 rounded-full bg-gradient-to-b from-orange-600 to-amber-800 grid place-items-center shadow-lg shadow-orange-900/30 hover:brightness-105"
                    >
                      <span className="text-white text-xl leading-none">{isIssuing ? "…" : "+"}</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="relative p-0 bg-transparent shrink-0 w-full snap-center md:w-auto">
                <Borderlesscard className="p-5 text-white rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10">
                  <p className="text-white/80 mb-2">You don&apos;t have any cards yet.</p>
                  <Button
                    onClick={handleIssueCardClick}
                    disabled={isIssuing}
                    className="bg-gradient-to-b from-orange-600 to-amber-800 text-white"
                  >
                    {isIssuing ? "Starting…" : "Issue new card"}
                  </Button>
                </Borderlesscard>
              </div>
            )}
          </div>

          {/* Donut/Stats */}
          <DonutStatsCard
            className="col-span-12 lg:col-span-3"
            totalIncome={Number(stats?.total_income ?? 0)}
            segmentPercents={(function () {
              const total = Number(stats?.total_income ?? 0) || 0;
              const d1 = Number(stats?.direct_income ?? 0) || 0;
              const d2 = Number(stats?.indirect_commission
                ?? 0) || 0;
              const base = total > 0 ? total : d1 + d2 || 1;
              const blue = Math.round((d1 / base) * 100);
              const yellow = Math.round((d2 / base) * 100);
              const orange = Math.max(0, 100 - blue - yellow);
              return { blue, yellow, orange };
            })()}
            stats={[
              { value: formatINR(stats?.wallet_main ?? 0), subtitle: "Main wallet" },
              { value: formatINR(stats?.wallet_commission ?? 0), subtitle: "Commission wallet" },
            ]}
          />
        </div>
      </section>

      {/* Summary: Direct Income, Down Line Income, Wallet Balance (wide) */}
      <section>
        <div className="grid grid-cols-12 gap-4">
          <Borderlesscard
            className="col-span-12 md:col-span-4 p-5 text-white relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
            }}
          >
            <DecorativeIncomeBackground />
            <p className="text-white/70 text-sm">Direct Income</p>
            <p className="text-3xl font-semibold mt-1">{formatINR(stats?.direct_income
 ?? 0)}</p>

            <div className="flex flex-row">
              <img src="/iconsvgs/up.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
              <p className="text-white/60 text-xs mt-1 ml-2">Team L1</p>
            </div>
          </Borderlesscard>
          <Borderlesscard
            className="col-span-12 md:col-span-4 p-5 text-white relative rounded-3xl  overflow-hidden"
            style={{
              background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
            }}
          >
            <DecorativeIncomeBackground />
            <p className="text-white/70 text-sm">Down Line Income</p>
            <p className="text-3xl font-semibold mt-1">{formatINR(stats?.indirect_commission
 ?? 0)}</p>
            <div className="flex flex-row">
              <img src="/iconsvgs/up.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
              <p className="text-white/60 text-xs mt-1 ml-2">Team L2</p>
            </div>
          </Borderlesscard>
          <Borderlesscard
            className="col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 p-5 text-white"
            style={{
              background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Wallet Balance</p>
                <p className="text-3xl font-semibold mt-1">{formatINR(stats?.wallet_main ?? 0)}</p>
                <div className="flex flex-row">
                  <img src="/iconsvgs/up.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
                  <p className="text-white/60 text-xs mt-1 ml-2">Available Funds</p>
                </div>
              </div>
              <div className="flex lg:flex-row flex-col  ml-2  lg:ml-0 items-center lg:gap-2  ">
                <Button className="bg-white/10 hover:bg-white/15 text-white mb-2 lg:mb-0">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Money
                </Button>
                <Button className="bg-white/10 hover:bg-white/15 text-white">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
            <div className="mt-3 text-right text-white/70 text-sm">Available Funds</div>
          </Borderlesscard>
        </div>
      </section>

      {/* Recent Lead Activities + Team Income */}
      <section>
        <div className="grid grid-cols-12 gap-4">
          <Borderlesscard className="col-span-12 lg:col-span-8  text-white bg-gradient-to-br from-stone-900/60 to-stone-950/60 border-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Recent Lead Activities</h3>
                  {/* Debug info - remove in production */}
                  <div className="text-xs text-white/40 mt-1">
                    Schemes: {schemes.length} | Selected: {selectedSchemeForPayments ? 'Yes' : 'No'} | 
                    <span 
                      className={authStatus === 'authenticated' ? 'text-green-400' : authStatus === 'error' ? 'text-red-400' : 'text-yellow-400'}
                      title="Authentication Status"
                    >
                      Auth: {authStatus === 'authenticated' ? 'OK' : authStatus === 'error' ? 'Error' : 'Checking'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Scheme Selector - only show if user has multiple schemes */}
                  {schemes.length > 1 && (
                    <Select
                      value={selectedSchemeForPayments}
                      onValueChange={(value) => {
                        console.log('Scheme selector changed to:', value);
                        setSelectedSchemeForPayments(value);
                        // Reload downline payments for the selected scheme
                        setTimeout(() => {
                          void loadDownlinePayments();
                        }, 100);
                      }}
                      disabled={downlinePaymentsLoading}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select scheme" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                        {schemes.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {downlinePaymentsLoading && (
                    <div className="text-xs text-white/60 flex items-center gap-1">
                      <span className="animate-spin">⟳</span>
                      Loading...
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    All Status
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed sm:table-auto">
                  <thead className="text-white/60">
                    <tr className="text-left">
                      <th className="py-2">Name</th>
                      <th className="py-2">Payment Method</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {downlinePayments.length > 0 ? (
                      downlinePayments.map((payment, index) => (
                        <tr key={`${payment.child_name}-${index}`} className="align-top">
                          <td className="py-3 whitespace-nowrap">{payment.child_name || "—"}</td>
                          <td className="py-3">{payment.payment_method || "—"}</td>
                          <td className="py-3">
                            <div className="min-w-0 max-w-[7.5rem] sm:max-w-none">
                              <div className="[&_*]:!whitespace-nowrap [&_*]:overflow-hidden [&_*]:text-ellipsis">
                                <PaymentStatusBadge status={payment.payment_status} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            {payment.payment_date 
                              ? new Date(payment.payment_date).toLocaleDateString("en-IN", { 
                                  year: "numeric", 
                                  month: "short", 
                                  day: "2-digit" 
                                })
                              : "—"
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-white/60">
                          {downlinePaymentsLoading 
                            ? "Loading payment statuses..." 
                            : schemes.length === 0
                              ? (
                                <div className="space-y-3">
                                  <div>No schemes found</div>
                                  <div className="text-xs text-white/40">
                                    {`Check console for errors. If you see 401 errors, try refreshing the page or logging in again.`}
                                  </div>
                                  <div className="flex gap-2 justify-center">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-white/20 text-white hover:bg-white/10"
                                      onClick={() => {
                                        console.log('Manual refresh triggered');
                                        void loadUserSchemes().then(scheme => {
                                          if (scheme) {
                                            void loadDownlinePayments(scheme);
                                          }
                                        });
                                      }}
                                    >
                                      Refresh Data
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-white/20 text-white hover:bg-white/10"
                                      onClick={() => {
                                        console.log('Refreshing auth session');
                                        void supabase.auth.refreshSession().then(({ error }) => {
                                          if (error) {
                                            console.error('Session refresh failed:', error);
                                          } else {
                                            console.log('Session refreshed, reloading data');
                                            setTimeout(() => {
                                              void loadUserSchemes().then(scheme => {
                                                if (scheme) {
                                                  void loadDownlinePayments(scheme);
                                                }
                                              });
                                            }, 1000);
                                          }
                                        });
                                      }}
                                    >
                                      Refresh Auth
                                    </Button>
                                  </div>
                                </div>
                              )
                              : selectedSchemeForPayments 
                              ? (
                                <div className="space-y-2">
                                  <div>No team members found for your scheme</div>
                                  <div className="text-xs text-white/40">
                                    Check console for debug info or invite team members to join your scheme
                                  </div>
                                </div>
                              )
                              : "Loading schemes..."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {downlinePayments.length > 0 && downlinePayments[0]?.total_count > 10 && (
                <div className="mt-3 text-center">
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View All ({downlinePayments[0].total_count})
                  </Button>
                </div>
              )}
            </CardContent>
          </Borderlesscard>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Borderlesscard
              className="p-4 text-white rounded-3xl "
              style={{
                background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
              }}
            >
              <h3 className="font-semibold mb-2">My Team Income</h3>
              <TeamIncomeChart
                values={[Number(stats?.team_paid ?? 0), Number(stats?.team_progress ?? 0), Number(stats?.team_unpaid ?? 0)]}
              />
            </Borderlesscard>
            <div className="grid grid-cols-2 gap-4">
              <Borderlesscard
                className="p-4 text-white relative rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
                }}
              >
                <DecorativeIncomeBackground />
                <h4 className="font-semibold text-sm">Active Users</h4>
                <p className="text-2xl font-semibold">{Number(stats?.l1_active_users ?? 0).toLocaleString("en-IN")}</p>
                <div className="flex flex-row">
                  <img src="/iconsvgs/up.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
                  <p className="text-white/60 text-xs mt-1 ml-2">L1 only</p>
                </div>
              </Borderlesscard>
              <Borderlesscard
                className="p-4 text-white relative rounded-3xl  overflow-hidden"
                style={{
                  background: "linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)",
                }}
              >
                <DecorativeIncomeBackground />
                <h4 className="font-semibold text-sm">Inactive Users</h4>
                <p className="text-2xl font-semibold">{Number(stats?.l1_inactive_users ?? 0).toLocaleString("en-IN")}</p>
                <div className="flex flex-row">
                  <img src="/iconsvgs/up.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
                  <p className="text-white/60 text-xs mt-1 ml-2">L1 only</p>
                </div>
              </Borderlesscard>
            </div>
          </div>
        </div>
      </section>

      {/* ---- NEW: Issue Card Dialog */}
      <Dialog open={issueOpen} onOpenChange={(v) => setIssueOpen(v)}>
        <DialogContent className="max-w-lg bg-[#1a120c] border-orange-600/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Issue New Card</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a scheme and a payment option to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
         

<div>
  <Label className="text-sm">Scheme</Label>
  <Select
    value={selectedScheme}
    // CHANGED LINE: Update both the selected scheme ID and the amount
    onValueChange={(value) => {
      const scheme = schemes.find((s) => s.id === value);
      setSelectedScheme(value);
      setSelectedAmount(scheme?.subscription_amount || 0);
      
      // Update payments tracking scheme and reload downline payments
      setSelectedSchemeForPayments(value);
      if (value) {
        // Reload downline payments for the new scheme
        setTimeout(() => {
          void loadDownlinePayments();
        }, 100);
      }
    }}
    disabled={schemesLoading || isIssuing}
  >
    <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-white">
      <SelectValue placeholder={schemesLoading ? "Loading schemes…" : "Select a scheme"} />
    </SelectTrigger>
    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
      {schemes.map((s) => (
        <SelectItem key={s.id} value={s.id}>
          {/* Display the scheme name and its amount in the dropdown for better UX */}
          {s.name} - {formatINR(s.subscription_amount)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {!schemesLoading && !schemes.length && (
    <p className="text-xs text-red-400 mt-1">No schemes available. Please try again later.</p>
  )}
</div>



            <div>
              <Label className="text-sm">Payment Option</Label>
              <Select value={paymentOption} onValueChange={(v) => setPaymentOption(v as PaymentOption)} disabled={isIssuing}>
                <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="upi_onetime">One-time UPI</SelectItem>
                  <SelectItem value="upi_mandate">UPI Mandate (auto)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-white/60 mt-1">
                One-time UPI collects once. UPI Mandate authorizes recurring payments.
              </p>
            </div>

            {issueError && <p className="text-sm text-red-400">{issueError}</p>}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIssueOpen(false)}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              disabled={isIssuing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleIssueConfirm}
              className="bg-gradient-to-b from-orange-600 to-amber-800 text-white"
              disabled={isIssuing || schemesLoading || !selectedScheme}
            >
              {isIssuing ? "Processing…" : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Success Popup */}
      {showPaymentSuccess && paymentReceipt && (
        <PaymentSuccessPopup
          receipt={paymentReceipt}
          onClose={() => {
            setShowPaymentSuccess(false);
            setPaymentReceipt(null);
          }}
          customTitle="CARD ISSUED SUCCESSFULLY"
          customSuccessMessage="Your new card has been issued successfully! You can now start using your new scheme."
        />
      )}
    </div>
  );
}

// Helpers and visuals (unchanged)
type DonutStatsProps = {
  className?: string;
  totalIncome: number;
  segmentPercents: { blue: number; yellow: number; orange: number };
  stats: { value: string; subtitle: string }[];
};

function DonutStatsCard({ className = "", totalIncome, segmentPercents, stats }: DonutStatsProps) {
  return (
    <Card className={`${className} p-2 lg:pt-8 py-8 text-white relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900/60 to-stone-950/60 border border-white/10`}>
      <div className="h-full w-full flex items-start gap-2">
        <div className="">
          <ExactDonut value={totalIncome} percents={segmentPercents} size={92} strokeWidth={18} />
          <div className="mt-2 flex items-center gap-3 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2A57FF" }} />
              <span className="text-[10px] text-white/70">Active income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F2B900" }} />
              <span className="text-[10px] text-white/70">Passive income</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="absolute left-36  w-full max-w-md mx-auto flex flex-col gap-2  ">
            {stats.slice(0, 2).map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#A15726] grid place-items-center shrink-0">
                  <img src="/iconsvgs/Donutwallet.svg" alt="Wallet" className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="rounded-lg  border border-orange-500/50 bg-transparent p-1">
                  <div className="h-9 rounded-md flex items-center justify-between  bg-black/25 backdrop-blur-[1px]">
                    <span className="text-base font-extrabold tracking-tight">{s.value}</span>
                    <div className="leading-[11px] text-[10px] text-white/80 ml-2">
                      <div>From</div>
                      <div>January</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

type PercentMap = { blue: number; yellow: number; orange: number };

type Props = {
  value: number;
  percents: PercentMap;
  size?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
};

function ExactDonut({ value, percents, size = 190, strokeWidth = 24, gap = 2, className }: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const raw = [percents.blue || 0, percents.yellow || 0, percents.orange || 0].map((n) =>
    Math.max(0, Number.isFinite(n) ? n : 0)
  );
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const norm = raw.map((n) => n / sum);

  const layout = useMemo(() => {
    const out: { len: number; off: number }[] = [];
    let acc = 0;
    for (let i = 0; i < norm.length; i++) {
      const fullLen = norm[i] * c;
      const visibleLen = Math.max(0, fullLen - gap);
      out.push({ len: visibleLen, off: acc });
      acc += fullLen + gap;
    }
    return out.map(({ len, off }) => ({ len, off: off % c }));
  }, [norm, c, gap]);

  const uid = useId();
  const gid = (name: string) => `${name}-${uid}`;
  const startRot = -90;

  const BLUE_A = "#335CFF",
    BLUE_B = "#1F3799";
  const YEL_A = "#FFC727",
    YEL_B = "#B88A09";
  const ORG_A = "#ED7A2A",
    ORG_B = "#9C480C",
    ORG_C = "#874618";

  const Arc = ({
    stroke,
    len,
    off,
    blur = false,
    opacity = 1,
    extraWidth = 0,
  }: {
    stroke: string;
    len: number;
    off: number;
    blur?: boolean;
    opacity?: number;
    extraWidth?: number;
  }) => (
    <circle
      cx={center}
      cy={center}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth + extraWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${len} ${Math.max(0, c - len)}`}
      strokeDashoffset={off}
      opacity={opacity}
      transform={`rotate(${startRot} ${center} ${center})`}
      shapeRendering="geometricPrecision"
      filter={blur ? `url(#${gid("blur")})` : undefined}
      vectorEffect="non-scaling-stroke"
    />
  );

  const [blue, yellow, orange] = layout;

  const formattedINR = useMemo(() => {
    const n = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  }, [value]);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-label="Donut chart" role="img">
      <defs>
        <linearGradient id={gid("gradBlue")} gradientUnits="userSpaceOnUse" x1={size * 0.2} y1={size * 0.85} x2={size * 0.75} y2={size * 0.1}>
          <stop offset="0%" stopColor={BLUE_A} />
          <stop offset="100%" stopColor={BLUE_B} />
        </linearGradient>
        <linearGradient id={gid("gradYellow")} gradientUnits="userSpaceOnUse" x1={size * 0.15} y1={size * 0.45} x2={size * 0.8} y2={size * 0.95}>
          <stop offset="0%" stopColor={YEL_A} />
          <stop offset="100%" stopColor={YEL_B} />
        </linearGradient>
        <linearGradient id={gid("gradOrange")} gradientUnits="userSpaceOnUse" x1={size * 0.88} y1={size * 0.7} x2={size * 0.68} y2={size * 0.05}>
          <stop offset="0%" stopColor={ORG_A} />
          <stop offset="46%" stopColor={ORG_B} />
          <stop offset="100%" stopColor={ORG_C} />
        </linearGradient>
      </defs>

      <circle cx={center} cy={center} r={r} fill="none" stroke="#ED7A2A" strokeWidth={strokeWidth} opacity="0.9" />
      {blue.len > 0 && <Arc stroke={`url(#${gid("gradBlue")})`} len={blue.len} off={blue.off} />}
      {yellow.len > 0 && <Arc stroke={`url(#${gid("gradYellow")})`} len={yellow.len} off={yellow.off} />}
      {orange.len > 0 && <Arc stroke={`url(#${gid("gradOrange")})`} len={orange.len} off={orange.off} />}
      <circle cx={center} cy={center} r={r - strokeWidth / 2 + 0.5} fill="white" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.max(12, strokeWidth * 1.05)}
        fontWeight={700}
        fill="#0F172A"
        style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system" }}
        pointerEvents="none"
      >
        {formattedINR}
      </text>
    </svg>
  );
}

function DecorativeIncomeBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 256 68"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 24.5649L3.1879 21.6982C6.58833 18.8316 13.1767 13.0983 19.5525 13.0983C26.1408 13.0983 32.7291 18.8316 39.3175 25.9982C45.6933 33.1648 52.2816 41.7647 58.8699 41.7647C65.4583 41.7647 71.8341 33.1648 78.4224 24.5649C85.0107 15.965 91.5991 7.36503 98.1874 3.06507C104.563 -1.23489 111.152 -1.23489 117.74 4.49839C124.328 10.2317 130.704 21.6982 137.292 30.2982C143.881 38.8981 150.469 44.6314 156.845 48.9313C163.433 53.2313 170.021 56.0979 176.61 50.3647C183.198 44.6314 189.574 30.2982 196.162 30.2982C202.751 30.2982 209.339 44.6314 215.715 47.498C222.303 50.3647 228.891 41.7647 235.48 34.5981C241.856 27.4315 248.444 21.6982 251.844 18.8316L255.032 15.965V67.5645H251.844C248.444 67.5645 241.856 67.5645 235.48 67.5645C228.891 67.5645 222.303 67.5645 215.715 67.5645C209.339 67.5645 202.751 67.5645 196.162 67.5645C189.574 67.5645 183.198 67.5645 176.61 67.5645C170.021 67.5645 163.433 67.5645 156.845 67.5645C150.469 67.5645 143.881 67.5645 137.292 67.5645C130.704 67.5645 124.328 67.5645 117.74 67.5645C111.152 67.5645 104.563 67.5645 98.1874 67.5645C91.5991 67.5645 85.0107 67.5645 78.4224 67.5645C71.8341 67.5645 65.4583 67.5645 58.8699 67.5645C52.2816 67.5645 45.6933 67.5645 39.3175 67.5645C32.7291 67.5645 26.1408 67.5645 19.5525 67.5645C13.1767 67.5645 6.58833 67.5645 3.1879 67.5645H0V24.5649Z"
        fill="url(#paint0_linear_1125_104213)"
        fillOpacity="0.15"
      />
      <defs>
        <linearGradient id="paint0_linear_1125_104213" x1="127.516" y1="18.3639" x2="127.516" y2="67.5645" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F46425" />
          <stop offset="1" stopColor="#F46425" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatusBadge({ status }: { status: "Paid" | "In Progress" | "Unpaid" | string }) {
  const cls =
    status === "Paid"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : status === "In Progress"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{status}</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : status === "pending" || status === "in_progress"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : status === "failed"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  
  const displayStatus = status === "paid" ? "Paid" 
    : status === "pending" ? "Pending"
    : status === "in_progress" ? "In Progress"
    : status === "failed" ? "Failed"
    : status === "unpaid" ? "Unpaid"
    : status;
    
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{displayStatus}</span>;
}

function TeamIncomeChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="h-36 flex items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1 bg-white/10 rounded-t-md border border-white/10" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}
