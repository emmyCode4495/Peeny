import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreatePostInput } from "@/types/database";

const PAGE_SIZE = 12;

/** GET /api/posts — feed with cursor pagination
 *  Query: ?cursor=<created_at>|<id>&category=shorts
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // format: created_at|id
  const category = searchParams.get("category");
  const userId = searchParams.get("user_id"); // filter by creator

  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      profile:profiles!posts_user_id_fkey (
        id, username, display_name, avatar_url, is_verified, tier
      )
    `
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (cursor) {
    const [created_at, id] = cursor.split("|");
    if (created_at && id) {
      // Keyset pagination: (created_at, id) < cursor
      query = query.or(
        `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`
      );
    }
  }

  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach liked_by_me for authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let likedSet = new Set<string>();
  if (user && posts && posts.length > 0) {
    const ids = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", ids);
    likedSet = new Set((likes ?? []).map((l) => l.post_id));
  }

  const items = (posts ?? []).map((p) => ({
    ...p,
    liked_by_me: likedSet.has(p.id),
  }));

  const last = items[items.length - 1];
  const nextCursor = last ? `${last.created_at}|${last.id}` : null;

  return NextResponse.json({
    posts: items,
    next_cursor: items.length === PAGE_SIZE ? nextCursor : null,
  });
}

/** POST /api/posts — create a new post */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreatePostInput;

  if (!body.title?.trim() || !body.video_url || !body.thumbnail_url) {
    return NextResponse.json(
      { error: "title, video_url and thumbnail_url are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      video_url: body.video_url,
      thumbnail_url: body.thumbnail_url,
      duration_seconds: body.duration_seconds ?? 0,
      category: body.category ?? "shorts",
      is_ai_generated: body.is_ai_generated ?? true,
    })
    .select(
      `
      *,
      profile:profiles!posts_user_id_fkey (
        id, username, display_name, avatar_url, is_verified, tier
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}