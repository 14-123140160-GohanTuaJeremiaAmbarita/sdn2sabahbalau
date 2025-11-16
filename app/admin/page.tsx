"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Heroicons
import {
  HiViewGrid,
  HiExternalLink,
  HiLogout,
  HiUserCircle,
  HiAcademicCap,
  HiCalculator,
  HiGlobe,
  HiSave,
  HiArrowLeft,
} from "react-icons/hi";

// 🔗 Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ====== SIDEBAR ======
const Sidebar = () => (
  <aside className="flex h-screen w-64 flex-col overflow-y-auto bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-8 text-white">
    <Link href="/" className="flex items-center space-x-2">
      {/* Pastikan file ini ada di public/Dokumentasi/logo.png */}
      <Image
        src="/Dokumentasi/logo.png"
        alt="Logo Sekolah"
        width={40}
        height={40}
      />
      <span className="text-xl font-bold">Admin Panel</span>
    </Link>

    <div className="mt-8 flex flex-1 flex-col justify-between">
      <ul className="flex flex-col space-y-2">
        <li>
          <Link
            href="/admin"
            className="flex items-center rounded-lg bg-white px-4 py-3 text-blue-600 font-semibold shadow"
          >
            <HiViewGrid className="mr-3" size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/akademik"
            className="flex items-center rounded-lg px-4 py-3 text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            <HiExternalLink className="mr-3" size={20} /> Lihat Situs
          </Link>
        </li>
      </ul>
      <ul>
        <li>
          <Link
            href="/"
            className="flex items-center rounded-lg px-4 py-3 text-red-300 transition-all hover:bg-red-500 hover:text-white"
          >
            <HiLogout className="mr-3" size={20} /> Logout
          </Link>
        </li>
      </ul>
    </div>
  </aside>
);

// ====== HALAMAN ADMIN ======
export default function AdminPage() {
  const router = useRouter();

  // Cek login dari localStorage
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // State untuk flow Supabase
  const [view, setView] = useState<"pilih-kelas" | "pilih-pelajaran" | "pilih-bab" | "form-materi">(
    "pilih-kelas"
  );
  const [kelas, setKelas] = useState("");
  const [pelajaran, setPelajaran] = useState("");
  const [babList, setBabList] = useState<any[]>([]);
  const [selectedBab, setSelectedBab] = useState<any>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // 🔐 Auth check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="p-10 text-center text-slate-600">
        Memeriksa sesi login...
      </div>
    );
  }

  // Ambil daftar bab dari Supabase setiap kali kelas / pelajaran berubah
  useEffect(() => {
    async function fetchVideos() {
      if (!kelas || !pelajaran) return;

      const { data, error } = await supabase
        .from("videos")
        .select("id, kelas, pelajaran, bab, youtube_url, title")
        .eq("kelas", kelas)
        .eq("pelajaran", pelajaran)
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Gagal mengambil data:", error);
      } else {
        setBabList(data || []);
      }

      console.log("🔍 Fetching videos for:", kelas, pelajaran);
      if (data?.length) {
        console.log(
          "✅ Contoh Bab Pertama (ID-nya harus ada):",
          data[0]
        );
      }
    }

    fetchVideos();
  }, [kelas, pelajaran]);

  // Update video di Supabase
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBab) return alert("Pilih bab dahulu");
    if (!youtubeUrl.trim()) return alert("Isi link YouTube");

    console.log("🛠️ Mencoba update bab:");
    console.log("   - ID Bab:", selectedBab.id);
    console.log("   - URL Baru:", youtubeUrl.trim());

    const { error } = await supabase
      .from("videos")
      .update({ youtube_url: youtubeUrl.trim() })
      .eq("id", selectedBab.id);

    if (error) {
      console.error("❌ SUPABASE UPDATE GAGAL:", error);
      alert(
        "❌ Gagal update! Cek RLS atau ID di konsol. Pesan: " +
          error.message
      );
      return;
    }

    alert("✅ Video berhasil diperbarui!");
    setView("pilih-bab");

    // Re-fetch data setelah update berhasil
    const { data } = await supabase
      .from("videos")
      .select("id, kelas, pelajaran, bab, youtube_url, title")
      .eq("kelas", kelas)
      .eq("pelajaran", pelajaran)
      .order("id", { ascending: true });

    setBabList(data || []);
  };

  return (
    <div className="flex bg-gray-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto h-screen">
        <h1 className="text-4xl font-bold text-slate-800">
          Dashboard Admin
        </h1>
        <p className="text-slate-500 mt-1">
          Selamat datang, admin. Kelola konten pembelajaran dari sini.
        </p>

        <hr className="my-6" />

        <div className="rounded-xl bg-white p-6 shadow-xl">
          {/* STEP 1: Pilih kelas */}
          {view === "pilih-kelas" && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Langkah 1: Pilih Kelas
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="card-admin cursor-pointer text-center p-6 border rounded-lg shadow hover:bg-blue-50"
                  onClick={() => {
                    setKelas("5");
                    setView("pilih-pelajaran");
                  }}
                >
                  <HiUserCircle
                    size={48}
                    className="text-blue-600 mb-2 mx-auto"
                  />
                  <h3 className="text-2xl font-semibold">Kelas 5</h3>
                </div>
                <div
                  className="card-admin cursor-pointer text-center p-6 border rounded-lg shadow hover:bg-blue-50"
                  onClick={() => {
                    setKelas("6");
                    setView("pilih-pelajaran");
                  }}
                >
                  <HiAcademicCap
                    size={48}
                    className="text-blue-600 mb-2 mx-auto"
                  />
                  <h3 className="text-2xl font-semibold">Kelas 6</h3>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Pilih pelajaran */}
          {view === "pilih-pelajaran" && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Langkah 2: Pilih Mata Pelajaran (Kelas {kelas})
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="card-admin-list flex items-center p-4 border rounded-lg shadow cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setPelajaran("Matematika");
                    setView("pilih-bab");
                  }}
                >
                  <HiCalculator
                    size={24}
                    className="text-blue-600 mr-3"
                  />
                  <span>Matematika</span>
                </div>
                <div
                  className="card-admin-list flex items-center p-4 border rounded-lg shadow cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setPelajaran("Bahasa Inggris");
                    setView("pilih-bab");
                  }}
                >
                  <HiGlobe
                    size={24}
                    className="text-blue-600 mr-3"
                  />
                  <span>Bahasa Inggris</span>
                </div>
              </div>

              <button
                onClick={() => setView("pilih-kelas")}
                className="btn-kembali mt-6 flex items-center text-slate-600 border px-4 py-2 rounded hover:bg-slate-50"
              >
                <HiArrowLeft className="mr-2" /> Kembali
              </button>
            </>
          )}

          {/* STEP 3: Pilih bab */}
          {view === "pilih-bab" && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Langkah 3: Pilih Bab ({pelajaran}, Kelas {kelas})
              </h2>

              {babList.length === 0 ? (
                <p className="text-slate-500">
                  Belum ada data video untuk pelajaran ini.
                </p>
              ) : (
                <div className="flex flex-col border rounded-lg overflow-hidden shadow">
                  {babList.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setSelectedBab(b);
                        setYoutubeUrl(b.youtube_url || "");
                        setView("form-materi");
                      }}
                    >
                      <div>
                        <strong>{b.bab}</strong>
                        <p className="text-slate-500 text-sm">
                          {b.title}
                        </p>
                      </div>
                      <span className="text-blue-600 text-sm">
                        {b.youtube_url
                          ? "🎬 Sudah ada video"
                          : "❌ Belum ada"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setView("pilih-pelajaran")}
                className="btn-kembali mt-6 flex items-center text-slate-600 border px-4 py-2 rounded hover:bg-slate-50"
              >
                <HiArrowLeft className="mr-2" /> Kembali
              </button>
            </>
          )}

          {/* STEP 4: Form update video */}
          {view === "form-materi" && selectedBab && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Langkah 4: Ubah Link Video ({selectedBab.bab})
              </h2>
              <form onSubmit={handleUpdate} className="max-w-2xl">
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    Link YouTube (format embed)
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="https://www.youtube.com/embed/xxxxx"
                    required
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Pastikan link menggunakan format &quot;embed&quot;.
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition-all"
                >
                  <HiSave className="mr-2" /> Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setView("pilih-bab")}
                  className="ml-3 border px-4 py-2 rounded flex items-center text-slate-700 hover:bg-slate-50"
                >
                  <HiArrowLeft className="mr-2" /> Kembali
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
