import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/wallet — current user's balance, credits, earnings summary */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, credits, balance_ngn, wallet_address, tier, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // columns may not exist yet — return zeros
    return NextResponse.json({
      credits: 0,
      balance_ngn: 0,
      total_earned: 0,
      total_views: 0,
      posts_count: 0,
      wallet_address: null,
      tier: "free",
      is_verified: false,
    });
  }

  // Aggregate from posts
  const { data: posts } = await supabase
    .from("posts")
    .select("earnings_ngn, views_count")
    .eq("user_id", user.id);

  const list = posts ?? [];
  const total_earned = list.reduce(
    (sum, p) => sum + Number(p.earnings_ngn || 0),
    0
  );
  const total_views = list.reduce(
    (sum, p) => sum + Number(p.views_count || 0),
    0
  );

  return NextResponse.json({
    credits: Number(profile.credits ?? 0),
    balance_ngn: Number(profile.balance_ngn ?? 0),
    total_earned,
    total_views,
    posts_count: list.length,
    wallet_address: profile.wallet_address,
    tier: profile.tier ?? "free",
    is_verified: profile.is_verified ?? false,
  });
}
