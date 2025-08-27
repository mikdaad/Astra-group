// NextRequest unused; remove to satisfy linter
import crypto from "crypto";
import { withAuth, ApiResponse } from "@/utils/api/authWrapper";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "SANDBOXTESTMID";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "51778fc0-016b-48fe-b509-108277bfa5e2";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";
const PAY_ENDPOINT = `${PHONEPE_BASE}/apis/hermes/pg/v1/pay`;

// --- Updated to accept scheme payment details ---
type InitiateBody = {
  amount?: number;
  mobileNumber?: string;
  cardId?: string;
  schemeId?: string;
  periodIndex?: number;
};

interface PhonePePayResponse {
  data?: {
    url?: string;
    instrumentResponse?: {
      redirectInfo?: {
        url?: string;
      };
    };
  };
}

export const POST = withAuth(async (req, { user, supabase }) => {
  try {
    const { 
        amount: amountFromBody, 
        mobileNumber: mobileFromBody,
        cardId,
        schemeId,
        periodIndex,
    } = (await req.json().catch(() => ({}))) as InitiateBody;

    let invoiceId: string;
    let amountRupees: number;
    let cardForInvoice: { id: string, scheme_id: string | null };

    // --- LOGIC BRANCH: Check if this is a Scheme Payment or Registration ---
    if (cardId && schemeId && periodIndex) {
        // --- THIS IS A SCHEME PAYMENT ---
        console.log("Initiating scheme payment for card:", cardId, "period:", periodIndex);

        // 1. Fetch the specific card to verify ownership and get details
        const { data: card, error: cardErr } = await supabase
            .from("cards")
            .select("id, scheme_id, user_id, scheme:schemes(subscription_amount)")
            .eq("id", cardId)
            .eq("user_id", user.id) // Security check: ensure card belongs to the user
            .single();

        if (cardErr || !card) {
            console.error("Fetch specific card error:", cardErr);
            return ApiResponse.error("Card not found or access denied.", 404);
        }
        
        cardForInvoice = card;

        // Use amount from request or fall back to the scheme's default amount
        amountRupees = amountFromBody ?? card.scheme[0]?.subscription_amount ?? 0;
        if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
            return ApiResponse.error("Invalid amount for scheme payment", 400);
        }
        
        // 2. Call a new RPC function to get/create the invoice for this specific period
        const { data: invoiceIdData, error: invoiceErr } = await supabase.rpc("ensure_scheme_payment_invoice", {
            p_user_id: user.id,
            p_card_id: cardId,
            p_scheme_id: schemeId,
            p_period_index: periodIndex,
            p_amount: amountRupees,
        });

        if (invoiceErr || !invoiceIdData) {
            console.error("ensure_scheme_payment_invoice error", invoiceErr);
            return ApiResponse.error("Failed to create scheme invoice", 500);
        }
        invoiceId = Array.isArray(invoiceIdData) ? invoiceIdData[0] : invoiceIdData;

    } else {
        // --- THIS IS A REGISTRATION PAYMENT (Original Logic) ---
        console.log("Initiating registration payment for user:", user.id);
        
        amountRupees = amountFromBody ?? Number(process.env.NEXT_PUBLIC_REGISTRATION_FEE_RS ?? 99);
        if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
          return ApiResponse.error("Invalid amount", 400);
        }
        
        // First, let's check what cards exist for this user
        const { data: allCards, error: allCardsErr } = await supabase
            .from("cards")
            .select("id, scheme_id, subscription_status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        
        console.log("All cards for user:", user.id, allCards);
        if (allCardsErr) {
            console.error("Error fetching all cards:", allCardsErr);
        }
        
        // For registration payments, we need to be more flexible with card status
        // First try to find an active card
        let { data: latestCard, error: cardErr } = await supabase
            .from("cards")
            .select("id, scheme_id, subscription_status")
            .eq("user_id", user.id)
            .eq("subscription_status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        // If no active card found, try to use the most recent card regardless of status
        if (cardErr || !latestCard) {
            console.log("No active card found, trying most recent card regardless of status");
            
            const mostRecentCard = allCards?.[0];
            if (mostRecentCard) {
                console.log(`Using most recent card with status '${mostRecentCard.subscription_status}'`);
                latestCard = {
                    id: mostRecentCard.id,
                    scheme_id: mostRecentCard.scheme_id,
                    subscription_status: mostRecentCard.subscription_status
                };
            } else {
                console.error("No cards found for user:", user.id);
                return ApiResponse.error("No cards found for this user. Please create a card first.", 400);
            }
        }
        cardForInvoice = latestCard;

        const { data: invoiceIdData, error: invoiceErr } = await supabase.rpc("ensure_registration_fee_invoice", {
            p_user_id: user.id,
            p_attach_card_id: cardForInvoice.id,
            p_scheme_id: cardForInvoice.scheme_id, // Use the scheme_id from the active card
            p_amount: amountRupees,
        });

        if (invoiceErr || !invoiceIdData) {
            console.error("ensure_registration_fee_invoice error", invoiceErr);
            return ApiResponse.error("Failed to create registration invoice", 500);
        }
        invoiceId = Array.isArray(invoiceIdData) ? invoiceIdData[0] : invoiceIdData;
    }

    // --- COMMON LOGIC: PHONEPE INTEGRATION (Unchanged) ---
    const invoiceIdFlat = invoiceId.replace(/-/g, "");
    const transactionId = `txn${invoiceIdFlat.slice(0, 10)}${Date.now().toString(36)}`;

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirect = `${origin.replace(/\/?$/,'')}/api/payment/callback/${transactionId}`;

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: Math.round(amountRupees * 100), // paise
      redirectUrl: redirect,
      redirectMode: "REDIRECT",
      callbackUrl: redirect,
      mobileNumber: (user as any).phone ?? mobileFromBody ?? undefined,
      paymentInstrument: { type: "PAY_PAGE" },
    } as const;

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    const hash = crypto.createHash("sha256").update(base64Payload + "/pg/v1/pay" + SALT_KEY).digest("hex");
    const xVerify = `${hash}###${SALT_INDEX}`;

    const res = await fetch(PAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-VERIFY": xVerify },
      body: JSON.stringify({ request: base64Payload }),
    });
    
    let data: PhonePePayResponse | undefined = undefined;
    const respType = res.headers.get("content-type") || "";
    if (respType.includes("application/json")) {
      data = (await res.json().catch(() => undefined)) as PhonePePayResponse | undefined;
    } else {
      const text = await res.text().catch(() => "");
      console.error("PhonePe pay endpoint returned non-JSON response", {
        httpStatus: res.status, bodyPreview: text.slice(0, 500),
      });
    }
    const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url || data?.data?.url;

    if (!redirectUrl) {
      console.error("PhonePe pay response", data);
      return ApiResponse.error("Failed to create payment session", 500);
    }
    
    const { error: mapErr } = await supabase
      .from("invoices")
      .update({ gateway_txid: transactionId })
      .eq("id", invoiceId);

    if (mapErr) {
      console.error("Failed to map invoice.gateway_txid:", mapErr);
    }

    return ApiResponse.success({ txid: transactionId, invoice_id: invoiceId, redirectUrl });
  } catch (e) {
    console.error("initiatepayment error", e);
    return ApiResponse.error("Unexpected error", 500);
  }
}, { name: "INITIATE PAYMENT API", methods: ["POST"] });