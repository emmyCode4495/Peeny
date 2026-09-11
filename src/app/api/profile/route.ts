import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UpdateProfileInput } from "@/types/database";

/** GET /api/profile — current authenticated user's profile */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

/** PATCH /api/profile — update current user's profile */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateProfileInput;

  // Basic validation
  if (body.username) {
    const cleaned = body.username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleaned.length < 3 || cleaned.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3–30 characters (a-z, 0-9, _)" },
        { status: 400 }
      );
    }
    body.username = cleaned;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(body)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
