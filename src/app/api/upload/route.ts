import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/upload
 * Body: { type: "video" | "thumbnail", filename: string, contentType: string }
 * Returns a signed upload URL for direct client → Storage upload (fast).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, filename, contentType } = body as {
    type: "video" | "thumbnail";
    filename: string;
    contentType: string;
  };

  if (!type || !filename || !contentType) {
    return NextResponse.json(
      { error: "type, filename, contentType required" },
      { status: 400 }
    );
  }

  const bucket = type === "video" ? "videos" : "thumbnails";
  const ext = filename.split(".").pop() || (type === "video" ? "mp4" : "jpg");
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    path,
    signed_url: data.signedUrl,
    token: data.token,
    public_url: publicUrl,
  });
}
