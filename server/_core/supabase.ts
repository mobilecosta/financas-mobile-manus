import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
  console.warn("[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
}

export const supabase = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
