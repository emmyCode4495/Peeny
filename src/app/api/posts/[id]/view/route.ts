import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/posts/[id]/view
 * TikTok-style: client should only call after ~2s of active watch.
 * Logged-in: one view per user per post (unique index).
 * Guest: still increments via insert without user_id (no unique constraint).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessionId: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    sessionId = body.session_id ?? null;
  } catch {
    /* empty body ok */
  }

  if (user) {
    // Already viewed?
    const { data: existing } = await supabase
      .from("views")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ counted: false, reason: "already_viewed" });
    }

    const { error } = await supabase.from("views").insert({
      post_id: postId,
      user_id: user.id,
      session_id: sessionId,
    });

    if (error) {
      // unique violation
      if (error.code === "23505") {
        return NextResponse.json({ counted: false, reason: "already_viewed" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Guest view — always insert (optimize with session_id uniqueness later)
    const { error } = await supabase.from("views").insert({
      post_id: postId,
      user_id: null,
      session_id: sessionId,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ counted: true });
}
