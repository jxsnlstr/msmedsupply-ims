import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;
let disabledClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

function createDisabledClient(): SupabaseClient {
  const disabledHandler: ProxyHandler<Record<string, unknown>> = {
    get() {
      return () => {
        throw new Error("Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      };
    },
  };
  return new Proxy({}, disabledHandler) as SupabaseClient;
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!disabledClient) {
    disabledClient = createDisabledClient();
  }
  return disabledClient;
}
export { isSupabaseConfigured };
