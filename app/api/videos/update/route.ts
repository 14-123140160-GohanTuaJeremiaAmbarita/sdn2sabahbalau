import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

const supabase = getSupabaseClient();

// Validasi environment variable
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Environment Supabase tidak ditemukan!");
  throw new Error("Supabase environment variable belum diatur dengan benar.");
}

// Endpoint API untuk update atau insert video
export async function POST(req: Request) {
  try {
    // Pastikan request bisa di-parse
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id, youtube_url } = body;

    // Debugging log
    console.log("📥 Data diterima di API:", { id, youtube_url });
    console.log("🔗 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("🔑 Supabase Key:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8) + "...");

    // Validasi input
    if (!id || !youtube_url) {
      return NextResponse.json(
        { success: false, error: "ID dan YouTube URL harus diisi" },
        { status: 400 }
      );
    }

    // Lakukan upsert (insert atau update otomatis)
    const { data, error } = await supabase
      .from("videos")
      .upsert({ id, youtube_url }, { onConflict: "id" });

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Video berhasil diperbarui:", data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("⚠️ Error tak terduga:", err.message || err);
    return NextResponse.json(
      { success: false, error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}
