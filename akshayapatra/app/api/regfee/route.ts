// app/api/regfee/route.ts

import crypto from "crypto";
import { withAuth, ApiResponse } from "@/utils/api/authWrapper";
import { NextRequest } from "next/server";

// --- Environment Variables ---
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "SANDBOXTESTMID";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "51778fc0-016b-48fe-b509-108277bfa5e2";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";
const PAY_ENDPOINT = `${PHONEPE_BASE}/apis/hermes/pg/v1/pay`;

// --- Request Body Type ---
type RegistrationBody = {
  amount?: number;
  schemeId: string; // schemeId is required to associate the registration with a scheme
};

interface PhonePePayResponse {
  data?: {
    instrumentResponse?: {
      redirectInfo?: {
        url?: string;
      };
    };
  };
}

export const POST = withAuth(async (req: NextRequest, { user, supabase }) => {
  try {
    const { 
        amount: amountFromBody,
        schemeId 
    } = (await req.json().catch(() => ({}))) as RegistrationBody;

    if (!schemeId) {
        return ApiResponse.error("schemeId is required.", 400);
    }

    // --- REGISTRATION PAYMENT LOGIC ---
    console.log("Initiating registration payment for user:", user.id);
    
    // Use amount from body or default to the registration fee from environment variables
    const amountRupees = amountFromBody ?? Number(process.env.NEXT_PUBLIC_REGISTRATION_FEE_RS ?? 99);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return ApiResponse.error("Invalid amount for registration.", 400);
    }
    
    // --- Create Registration Invoice ---
    // This RPC function should create an invoice with type 'registration'
    const { data: invoiceIdData, error: invoiceErr } = await supabase.rpc("ensure_registration_fee_invoice", {
      p_user_id: user.id,
      p_scheme_id: schemeId,
      p_amount: amountRupees,
    });

    if (invoiceErr || !invoiceIdData) {
      console.error("ensure_registration_fee_invoice error", invoiceErr);
      return ApiResponse.error("Failed to create registration invoice", 500);
    }
    const invoiceId = Array.isArray(invoiceIdData) ? invoiceIdData[0] : invoiceIdData;

    // --- PHONEPE INTEGRATION ---
    const transactionId = `REG${invoiceId.replace(/-/g, "").slice(0, 10)}${Date.now().toString(36)}`;
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${origin.replace(/\/?$/,'')}/api/regfeepayment/callback/${transactionId}`;

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: Math.round(amountRupees * 100), // Amount in paise
      redirectUrl: callbackUrl, // User is redirected here after payment
      redirectMode: "REDIRECT",
      callbackUrl: callbackUrl, // S2S callback is sent here
      mobileNumber: (user as any).phone ?? undefined,
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
    
    const data = (await res.json().catch(() => ({}))) as PhonePePayResponse;
    const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectUrl) {
      console.error("PhonePe registration pay response error:", data);
      return ApiResponse.error("Failed to create payment session", 500);
    }
    
    // Map the transaction ID to the invoice for later lookup in the callback
    const { error: mapErr } = await supabase
      .from("invoices")
      .update({ gateway_txid: transactionId })
      .eq("id", invoiceId);

    if (mapErr) {
      console.error("Failed to map invoice.gateway_txid:", mapErr);
    }

    return ApiResponse.success({ txid: transactionId, invoice_id: invoiceId, redirectUrl });
  } catch (e) {
    console.error("regfee_error", e);
    return ApiResponse.error("An unexpected error occurred", 500);
  }
}, { name: "REGISTRATION FEE API", methods: ["POST"] });
