import { createClient } from "@supabase/supabase-js";

NEXT_PUBLIC_SUPABASE_URL=https://gocfzepgblacfefnvwxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vStB5JLZ3PrOyLpojK_Cg_RMKZ4G1s

if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // In a real app we might want to surface this, but for now
  // we just avoid creating a broken client.
  console.warn(
    "Supabase URL or anon key is not set. Realtime features will be disabled."
  );
}

export const supabase =
  NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null;

