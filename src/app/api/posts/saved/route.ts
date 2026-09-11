import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/posts/saved — posts the current user has saved */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: saves, error } = await supabase
    .from("saves")
    .select("post_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (saves ?? []).map((s) => s.post_id);
  if (ids.length === 0) {
    return NextResponse.json({ posts: [] });
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profile:profiles!posts_user_id_fkey (
        id, username, display_name, avatar_url, is_verified, tier
      )
    `
    )
    .in("id", ids);

  if (postsError) {
    return NextResponse.json({ error: postsError.message }, { status: 500 });
  }

  const byId = new Map((posts ?? []).map((p) => [p.id, p]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((p) => ({ ...p!, saved_by_me: true }));

  return NextResponse.json({ posts: ordered });
}
