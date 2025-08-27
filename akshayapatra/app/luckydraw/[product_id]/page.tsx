"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { getSchemePeriods } from "@/app/lib/rpc";

type PriceRow = { label: string; value: number; emphasis?: boolean };

type ProductData = {
  id: string;
  title: string;
  month: string;
  price: number;
  image: string;
  schemeId: string;
  cardId: string;
  periodIndex: number;
  dueDate?: string;
};

export default function ProductCheckoutPage() {
  const params = useParams<{ product_id: string }>();
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse the product_id to extract cardId, schemeId, and periodIndex
  const parseProductId = (productId: string) => {
    try {
      // Decode URL component and split by pipe separator
      const decoded = decodeURIComponent(productId);
      const parts = decoded.split('|');
      if (parts.length >= 3) {
        return {
          cardId: parts[0],
          schemeId: parts[1],
          periodIndex: parseInt(parts[2])
        };
      }
    } catch (error) {
      console.error("Failed to decode product ID:", error);
    }
    return null;
  };

  // Fetch product data
  useEffect(() => {
    const loadProductData = async () => {
      if (!params.product_id) {
        setError("Invalid product ID");
        setIsLoading(false);
        return;
      }

             const parsed = parseProductId(params.product_id);
       if (!parsed) {
         setError("Invalid product ID format");
         setIsLoading(false);
         return;
       }

              console.log("Parsed product ID:", parsed);

       // Validate UUID format
       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
       if (!uuidRegex.test(parsed.cardId) || !uuidRegex.test(parsed.schemeId)) {
         setError("Invalid UUID format in product ID");
         setIsLoading(false);
         return;
       }

       try {
         // Fetch the period data
         console.log("Fetching periods for schemeId:", parsed.schemeId);
         const periods = await getSchemePeriods(parsed.schemeId, supabase);
        const period = periods.find((p: any) => p.period_index === parsed.periodIndex);
        
        if (!period) {
          setError("Period not found");
          setIsLoading(false);
          return;
        }

        // Fetch card details to get scheme information
        const res = await fetch('/api/cards');
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch card details.');
        }

        const card = json.cards.find((c: any) => c.id === parsed.cardId);
        if (!card || !card.scheme) {
          setError("Card or scheme not found");
          setIsLoading(false);
          return;
        }

        const productData: ProductData = {
          id: params.product_id,
          title: `${new Date(period.period_start).toLocaleDateString('en-US', { month: 'long' })} Month`,
          month: `${new Date(period.period_start).toLocaleDateString('en-US', { month: 'long' })} Draw`,
          price: card.scheme.subscription_amount,
          image: period.cover_image_url || "/images/reward/reward1.png",
          schemeId: parsed.schemeId,
          cardId: parsed.cardId,
          periodIndex: parsed.periodIndex,
          dueDate: new Date(period.period_end).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit' 
          })
        };

        setProduct(productData);
      } catch (err: any) {
        console.error("Failed to load product data:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProductData();
  }, [params.product_id, supabase]);

  if (isLoading) {
    return (
      <main className="min-h-screen w-full text-white">
        <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>
        <div className="flex justify-center items-center h-64 text-white/70">
          <Loader2 className="w-8 h-8 animate-spin mr-3"/> Loading product details...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen w-full text-white">
        <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-5 text-center text-red-400">
          <p>{error || "Product not found"}</p>
        </div>
      </main>
    );
  }

  const gst = Math.round(product.price * 0.18);
  const platform = 20;
  const subTotal = product.price + gst + platform;

  const rows: PriceRow[] = [
    { label: "Total", value: product.price },
    { label: "MPIN", value: 0 },
    { label: "Applicable GST 18%", value: gst },
    { label: "Platform Fee", value: platform },
    { label: "Sub Total", value: subTotal, emphasis: true },
  ];

  const handlePay = async () => {
    try {
      const res = await fetch("/api/initiatepayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cardId: product.cardId,
          schemeId: product.schemeId,
          periodIndex: product.periodIndex,
          amount: product.price
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.redirectUrl) {
        console.error("initiatepayment failed", json);
        alert(json.message || "Failed to start payment. Please try again.");
        return;
      }
      window.location.assign(json.redirectUrl as string);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to start payment. Please try again.");
    }
  };

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto max-w-6xl lg:px-5 px-0 py-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
      </div>

      <section className="mx-auto max-w-6xl px-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product visual and description */}
        <div className="rounded-2xl p-4">
          <div className="rounded-xl overflow-hidden bg-black/30">
            <Image 
              src={product.image} 
              alt={product.title} 
              width={960} 
              height={540} 
              className="w-full h-auto object-contain" 
            />
          </div>
          <div className="mt-5">
            <h2 className="text-2xl font-semibold">{product.title}</h2>
            <div className="mt-2 flex items-center justify-between text-sm text-white/70">
              <span>₹ {product.price} Only</span>
              <span>{product.month}</span>
            </div>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Participate in the monthly draw by paying just ₹{product.price} and stand a chance to win exclusive prizes.
              Make your first move and secure your spot in the race to win big.
            </p>
            <div className="mt-4 text-sm">
              <span className="text-white/60">Due Date</span> 
              <span className="font-semibold ml-2">{product.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Checkout card */}
        <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
          <button className="w-full flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-left">
            <span className="inline-flex items-center gap-2">
              <span className="inline-grid place-items-center h-6 w-6 rounded-full bg-white/10">🔒</span>
              <span>Apply MPIN</span>
            </span>
            <span>›</span>
          </button>

          <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 text-sm bg-white/5">Price Details <span className="text-white/60">(1 item)</span></div>
            <div className="divide-y divide-white/10 text-sm">
              {rows.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3">
                  <span className={r.emphasis ? "font-medium" : undefined}>{r.label}</span>
                  <span className={r.emphasis ? "font-semibold" : undefined}>₹ {r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handlePay}
            className="mt-6 w-full rounded-xl px-6 py-3 font-semibold bg-gradient-to-b from-orange-600 to-amber-800 hover:from-orange-600 hover:to-orange-700"
          >
            Pay Now
          </button>
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}


