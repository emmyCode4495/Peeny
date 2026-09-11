import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/posts/[id]/share — increment share count + return share URL */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const supabase = await createClient();

  // Atomic-ish increment
  const { data: post } = await supabase
    .from("posts")
    .select("shares_count, title")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = Number(post.shares_count || 0) + 1;
  await supabase.from("posts").update({ shares_count: next }).eq("id", postId);

  return NextResponse.json({
    shares_count: next,
    share_url: `/post/${postId}`,
  });
}
