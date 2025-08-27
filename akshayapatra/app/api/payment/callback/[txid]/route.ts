import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "SANDBOXTESTMID";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "51778fc0-016b-48fe-b509-108277bfa5e2";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";

export async function GET(req: Request) {
  const supabase = createAdminClient();
  const url = new URL(req.url);
  const baseRedirectUrl = new URL(url.origin);

  try {
    const pathParts = url.pathname.split("/");
    const merchantTransactionId = pathParts[pathParts.length - 1] || "";

    if (!merchantTransactionId) {
      console.error("Callback Error: Invalid transaction ID in URL.");
      baseRedirectUrl.pathname = "/luckydraw";
      baseRedirectUrl.searchParams.set("payment", "failed");
      baseRedirectUrl.searchParams.set("error", "invalid_txid");
      return NextResponse.redirect(baseRedirectUrl);
    }

    // 1. Verify payment status with PhonePe
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerifyChecksum = `${sha256Hash}###${SALT_INDEX}`;
    const statusUrl = `${PHONEPE_BASE}/apis/hermes/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

    const response = await fetch(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerifyChecksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    const isSuccess = data?.code === "PAYMENT_SUCCESS";

    // 2. Find the corresponding invoice in our database
    const { data: invoiceRow, error: invErr } = await supabase
      .from("invoices")
      .select("id, type") // Select the 'type' to determine redirection
      .eq("gateway_txid", merchantTransactionId)
      .single();

    if (invErr) {
      console.error("Callback Error: Invoice lookup failed for txid", merchantTransactionId, invErr);
    }

    let invoiceType = invoiceRow?.type;

    // 3. If payment was successful, process all database updates via our new RPC function
    if (isSuccess && invoiceRow) {
      const { data: processedType, error: rpcError } = await supabase.rpc("handle_successful_payment", {
          p_invoice_id: invoiceRow.id,
          p_gateway_txid: merchantTransactionId,
        }
      );

      if (rpcError) {
        console.error("Callback Error: handle_successful_payment RPC failed.", rpcError);
        // The payment succeeded but our DB update failed. This is a critical error to log.
      } else {
        console.log(`Successfully processed payment for invoice ${invoiceRow.id} of type ${processedType}`);
        invoiceType = processedType; // Use the type returned from the function
      }
    } else if (isSuccess && !invoiceRow) {
      console.error("Callback Critical Error: Payment succeeded but no invoice found for txid", merchantTransactionId);
    }

    // 4. Redirect the user based on the outcome and invoice type
    if (isSuccess && invoiceType) {
        if (invoiceType === 'scheme_payment') {
            baseRedirectUrl.pathname = "/luckydraw";
            baseRedirectUrl.searchParams.set("payment", "success");
        } else { // Assumes 'registration_fee' or any other type
            baseRedirectUrl.pathname = "/";
            baseRedirectUrl.searchParams.set("payment", "success");
        }
    } else {
        // Determine failure redirect based on what we know
        if (invoiceType === 'scheme_payment') {
            baseRedirectUrl.pathname = "/luckydraw";
        } else {
            baseRedirectUrl.pathname = "/";
        }
        baseRedirectUrl.searchParams.set("payment", "failed");
    }
    
    return NextResponse.redirect(baseRedirectUrl);

  } catch (error) {
    console.error("Callback Fatal Error: An unexpected error occurred.", error);
    baseRedirectUrl.pathname = "/"; // Generic fallback on total failure
    baseRedirectUrl.searchParams.set("payment", "failed");
    baseRedirectUrl.searchParams.set("error", "unexpected");
    return NextResponse.redirect(baseRedirectUrl);
  }
}