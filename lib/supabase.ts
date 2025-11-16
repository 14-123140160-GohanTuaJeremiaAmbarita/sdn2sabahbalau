// 📁 /lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Variable global untuk cache Supabase client
let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("❌ Supabase environment belum diset di .env.local");
    }

    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("✅ Supabase client dibuat baru");
  } else {
    console.log("♻️ Supabase client digunakan ulang dari cache");
  }

  return supabase;
}
