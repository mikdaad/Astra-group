import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let supabaseResponse = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing scheme id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("schemes")
      .select("id, name, status, image_url, total_installments, subscription_amount")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "Scheme not found" }, { status: 404 });
    }

    // Build JSON response and propagate any cookies set in the SSR client
    const json = NextResponse.json({ success: true, scheme: data });
    supabaseResponse.cookies.getAll().forEach(({ name, value  }) => {
      json.cookies.set(name, value );
    });
    return json;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Server error" }, { status: 500 });
  }
}