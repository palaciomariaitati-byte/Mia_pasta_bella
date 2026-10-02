import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components (navegador)
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-local-anon-key";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
