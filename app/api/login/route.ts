import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const { data: dataUser, error } = await supabase
      .from('admin')
      .select('*')
      .ilike('username', `%${username.trim()}%`);

    const user = dataUser && dataUser.length > 0 ? dataUser[0] : null;

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Username tidak ditemukan' });
    }

    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Password salah' });
    }

    // ✅ Kalau login berhasil, buat respons
    const res = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
    });

    // ✅ Simpan cookie biar middleware tahu kalau user udah login
    res.cookies.set('sb_admin', JSON.stringify(user), {
      path: '/',
      httpOnly: false, // karena kita mau bisa baca di client juga
      sameSite: 'lax',
    });

    return res;
  } catch (err) {
    console.error('Error di API login:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
}
