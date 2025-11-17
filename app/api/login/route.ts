import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    console.log("LOGIN_API_INPUT", { username, password });

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();

    console.log("LOGIN_API_RESULT", { data, error });

    if (error) {
      console.error("SUPABASE_LOGIN_ERROR", error);
      return NextResponse.json(
        { success: false, message: "Terjadi error saat menghubungi database" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
      },
    });
  } catch (err) {
    console.error("LOGIN_API_FATAL", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
