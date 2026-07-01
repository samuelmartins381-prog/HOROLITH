"use client";

import { useServerSync } from "@/src/hooks/useServerSync";

/**
 * Root client provider.
 * Initialises Supabase auth and syncs server state into Zustand stores.
 * Mount once in the root layout so auth is available on every page.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  useServerSync();
  return <>{children}</>;
}
