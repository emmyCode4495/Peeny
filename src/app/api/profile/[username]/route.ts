import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/profile/[username] — public profile + their posts */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Latest posts by this creator
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  // Is the current user following them?
  let is_following = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user.id !== profile.id) {
    const { data: follow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    is_following = !!follow;
  }

  return NextResponse.json({
    profile,
    posts: posts ?? [],
    is_following,
    is_own: user?.id === profile.id,
  });
}
