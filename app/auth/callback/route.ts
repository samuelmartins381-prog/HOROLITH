import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/**
 * Exchanges the PKCE code from the magic-link email for a Supabase session.
 * Supabase redirects here after the user clicks the magic link:
 *   https://<domain>/auth/callback?code=<pkce_code>&next=<redirect>
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/play/open";

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // On failure, redirect to the open page with an error flag
  return NextResponse.redirect(`${origin}/play/open?auth_error=1`);
}
