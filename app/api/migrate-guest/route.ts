import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { collection } = body as { collection?: Record<string, number> };
  if (!collection || typeof collection !== "object" || Array.isArray(collection)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rows = Object.entries(collection)
    .filter(([, qty]) => typeof qty === "number" && qty > 0)
    .map(([card_id, quantity]) => ({ user_id: user.id, card_id, quantity }));

  if (rows.length === 0) {
    return NextResponse.json({ migrated: 0 });
  }

  const { error } = await supabase
    .from("collections")
    .upsert(rows, { onConflict: "user_id,card_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ migrated: rows.length });
}
