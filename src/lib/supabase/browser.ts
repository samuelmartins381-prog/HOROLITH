import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a singleton browser-side Supabase client.
 * Returns null when environment variables are not set (guest / local-dev mode).
 */
export function getBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!_client) {
    _client = createBrowserClient(url, key);
  }
  return _client;
}
