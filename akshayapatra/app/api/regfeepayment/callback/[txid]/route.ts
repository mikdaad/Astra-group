// app/api/regfeepayment/callback/[txid]/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient

 } from "@/utils/supabase/server";


// --- Environment Variables ---
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "SANDBOXTESTMID";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "51778fc0-016b-48fe-b509-108277bfa5e2";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";

// Use the Service Role Key for backend operations (for RPC calls, etc.)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txid: string }> }
) {
  console.log("=== REGFEE PAYMENT CALLBACK STARTED ===");

 
  const supabase = createClient(
  
  );
  
  const { txid } = await params;
  const merchantTransactionId = txid;
  const origin = req.nextUrl.origin;
  const baseRedirectUrl = new URL(origin);

  console.log("Callback parameters:", {
    merchantTransactionId,
    origin,
    baseRedirectUrl: baseRedirectUrl.toString()
  });

  try {
    if (!merchantTransactionId) {
      console.error("Callback Error: Invalid transaction ID in URL.");
      console.log("Redirecting to signup with payment=failed and error=invalid_txid");
      baseRedirectUrl.pathname = "/signup";
      baseRedirectUrl.searchParams.set("payment", "failed");
      baseRedirectUrl.searchParams.set("error", "invalid_txid");
      return NextResponse.redirect(baseRedirectUrl);
    }

    console.log("Step 1: Verifying payment status with PhonePe...");
    
    // 1) Verify payment status with PhonePe
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerifyChecksum = `${sha256Hash}###${SALT_INDEX}`;
    const statusUrl = `${PHONEPE_BASE}/apis/hermes/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

    console.log("PhonePe status check details:", {
      merchantId: MERCHANT_ID,
      stringToHash: stringToHash.substring(0, 50) + "...",
      statusUrl
    });

    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerifyChecksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("PhonePe API response status:", response.status);

    const data = await response.json().catch(() => null);
    const isSuccess = data?.code === "PAYMENT_SUCCESS";

    console.log("PhonePe payment status:", {
      responseData: data,
      isSuccess,
      paymentCode: data?.code
    });

    // 2) Find the invoice
    console.log("Step 2: Looking up invoice in database...");
    
    const { data: invoiceRow, error: invErr } = await(await supabase)
      .from("invoices")
      .select("id, type, status, card_id") // card_id is no longer needed for getting user, but might be useful for logs
      .eq("gateway_txid", merchantTransactionId)
      .single();

    if (invErr) {
      console.error("Callback Error: Invoice lookup failed for txid", merchantTransactionId, invErr);
    } else {
      console.log("Invoice lookup successful:", {
        invoiceId: invoiceRow?.id,
        invoiceType: invoiceRow?.type,
        invoiceStatus: invoiceRow?.status,
      });
    }

    let invoiceType = invoiceRow?.type;

    // 3) If payment succeeded and invoice isn't already paid, process it
    if (isSuccess && invoiceRow && invoiceRow.status !== "paid") {
      console.log("Step 3: Processing successful payment for unpaid invoice...");
      
      // --- MODIFIED SECTION: Fetch user ID from Auth session ---
      let userId: string | null = null;
      console.log("Attempting to get authenticated user from session...");

      const { data: { user }, error: authError } = await(await supabase).auth.getUser();

      if (authError || !user) {
        console.error("Callback Critical Error: Could not get authenticated user from session.", authError);
      } else {
        userId = user.id;
        console.log("Successfully retrieved authenticated user_id:", userId);
      }
      // --- END MODIFIED SECTION ---

      if (!userId) {
        console.error(
          "Callback Critical Error: Could not resolve user_id for invoice",
          invoiceRow.id
        );
      } else {
        console.log("Calling handle_successful_payment_reg RPC with params:", {
          invoiceId: invoiceRow.id,
          gatewayTxid: merchantTransactionId,
          userId: userId
        });
        
        const { data: processedType, error: rpcError } = await(await supabase).rpc(
          "handle_successful_payment_reg",
          {
            p_invoice_id: invoiceRow.id,
            p_gateway_txid: merchantTransactionId,
            p_user_id: userId,
          }
        );

        if (rpcError) {
          console.error("Callback Error: handle_successful_payment_reg RPC failed.", rpcError);
        } else {
          console.log(`Successfully processed payment for invoice ${invoiceRow.id} of type ${processedType}`);
          invoiceType = processedType || invoiceType;
          console.log("Updated invoice type after processing:", invoiceType);
        }
      }
    } else if (isSuccess && !invoiceRow) {
      console.error(
        "Callback Critical Error: Payment succeeded but no invoice found for txid",
        merchantTransactionId
      );
    } else if (isSuccess && invoiceRow && invoiceRow.status === "paid") {
      console.log("Payment succeeded but invoice is already marked as paid:", {
        invoiceId: invoiceRow.id,
        invoiceStatus: invoiceRow.status
      });
    } else if (!isSuccess) {
      console.log("Payment was not successful, skipping processing");
    }

    // 4) Redirect based on outcome
    console.log("Step 4: Determining redirect destination...");
    console.log("Redirect decision factors:", {
      isSuccess,
      invoiceType,
      basePath: baseRedirectUrl.pathname
    });

    if (isSuccess && invoiceType) {
      if (invoiceType === "scheme_payment") {
        console.log("Redirecting to luckydraw for scheme payment success");
        baseRedirectUrl.pathname = "/luckydraw";
      } else {
        console.log("Redirecting to home for regular payment success");
        baseRedirectUrl.pathname = "/";
      }
      baseRedirectUrl.searchParams.set("payment", "success");
    } else {
      console.log("Redirecting for failed payment or missing invoice type");
      baseRedirectUrl.pathname = invoiceType === "scheme_payment" ? "/luckydraw" : "/";
      baseRedirectUrl.searchParams.set("payment", "failed");
    }

    const finalRedirectUrl = baseRedirectUrl.toString();
    console.log("Final redirect URL:", finalRedirectUrl);
    console.log("=== REGFEE PAYMENT CALLBACK COMPLETED ===");

    return NextResponse.redirect(baseRedirectUrl);
  } catch (error) {
    console.error("Callback Fatal Error: An unexpected error occurred.", error);
    console.log("Redirecting to home with payment=failed and error=unexpected");
    baseRedirectUrl.pathname = "/";
    baseRedirectUrl.searchParams.set("payment", "failed");
    baseRedirectUrl.searchParams.set("error", "unexpected");
    console.log("=== REGFEE PAYMENT CALLBACK FAILED ===");
    return NextResponse.redirect(baseRedirectUrl);
  }
}