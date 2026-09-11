import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/posts/[id]/like — like a post */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("likes").insert({
    user_id: user.id,
    post_id: postId,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ liked: true }); // already liked
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: true });
}

/** DELETE /api/posts/[id]/like — unlike a post */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: false });
}