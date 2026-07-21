import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for Client Components (the admin login form). Only ever
 * used for auth — product/order data always goes through server-side
 * route handlers, never queried directly from the client.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
    );
  }

  return createBrowserClient(url, anonKey);
}
