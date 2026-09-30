"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowerIcon } from "@/components/FloralDecor";
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"petugas" | "admin">("petugas");

  // Form states
  const [namaBertugas, setNamaBertugas] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (activeTab === "petugas" && !namaBertugas.trim()) {
      setErrorMsg("Nama Petugas yang Bertugas wajib diisi.");
      return;
    }

    if (!username.trim() || !password) {
      setErrorMsg("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          nama_bertugas: activeTab === "petugas" ? namaBertugas : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      if (data.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/petugas/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF5EF] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white border border-[#EADFD5] rounded-3xl shadow-[0_20px_50px_rgba(78,70,99,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

        {/* LEFT COLUMN: EDITORIAL VISUAL HERO */}
        <div className="lg:col-span-5 bg-[#FAF0ED] border-r border-[#F0D5CE] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Scalloped Circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#F3CECE]/40 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-[#4E4663]/10 blur-2xl pointer-events-none" />

          {/* Top Logo & Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F0D5CE] shadow-xs">
              <FlowerIcon className="w-4 h-4 text-[#9B3B3B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#9B3B3B]">
                SMK CITRA NEGARA
              </span>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#272023] mt-6 tracking-tight leading-tight">
              Kasir<span className="text-[#9B3B3B] italic">Ku</span>
            </h1>
            <p className="text-sm text-[#695E63] mt-3 font-normal leading-relaxed">
              Sistem Kasir Modern dengan Desain Editorial Premium, Anggun, dan Terstruktur.
            </p>
          </div>

          {/* Middle Decorative Paper Card */}
          <div className="relative z-10 my-8 p-6 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#EADFD5] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#9B3B3B] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Akses Multi-Role</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#272023]">
              <div className="p-2.5 rounded-xl bg-[#FAF5EF] border border-[#EADFD5]">
                <span className="font-bold block text-[#4E4663]">👑 Admin</span>
                <span className="text-[11px] text-[#7D7075]">Kelola barang, stok & petugas</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF5EF] border border-[#EADFD5]">
                <span className="font-bold block text-[#9B3B3B]">💼 Petugas</span>
                <span className="text-[11px] text-[#7D7075]">Transaksi & Laporan Shift</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 text-xs text-[#8C7E84] pt-4 border-t border-[#F0D5CE]">
            &copy; {new Date().getFullYear()} KasirKu — Aesthetic Editorial Cashier
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH FORM */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          {/* TAB SWITCHER */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF5EF] rounded-2xl border border-[#EADFD5] mb-8">
            <button
              onClick={() => { setActiveTab("petugas"); setErrorMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "petugas"
                  ? "bg-[#9B3B3B] text-white shadow-sm"
                  : "text-[#695E63] hover:text-[#272023]"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Petugas Kasir</span>
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setErrorMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "admin"
                  ? "bg-[#4E4663] text-white shadow-sm"
                  : "text-[#695E63] hover:text-[#272023]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* HEADING PER TAB */}
          <div className="mb-6">
            {activeTab === "petugas" ? (
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#272023]">Login Petugas Kasir</h2>
                <p className="text-xs text-[#695E63] mt-1">
                  Masukkan Nama Petugas yang Bertugas, username, dan password untuk memulai shift.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#272023]">Login Administrator</h2>
                <p className="text-xs text-[#695E63] mt-1">
                  Masuk untuk kelola produk, stok, registrasi petugas, dan pengaturan sistem.
                </p>
              </div>
            )}
          </div>

          {/* ALERT MESSAGES */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38] text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* FIELD: NAMA PETUGAS YANG BERTUGAS (ONLY FOR PETUGAS TAB) */}
            {activeTab === "petugas" && (
              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                  Nama Petugas yang Bertugas <span className="text-[#9B3B3B]">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B3B3B]" />
                  <input
                    type="text"
                    required
                    value={namaBertugas}
                    onChange={(e) => setNamaBertugas(e.target.value)}
                    placeholder="Contoh: Rina Melati / Budi Kasir"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm font-semibold text-[#272023] focus:outline-none focus:border-[#9B3B3B] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#7D7075] mt-1">
                  Nama ini akan dicetak pada nota/struk transaksi yang Anda layani.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === "admin" ? "admin" : "petugas"}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  activeTab === "admin"
                    ? "bg-[#4E4663] hover:bg-[#3B344D]"
                    : "bg-[#9B3B3B] hover:bg-[#833131]"
                } disabled:opacity-50`}
              >
                {loading ? (
                  "Memproses..."
                ) : (
                  <>
                    <span>Masuk ke System {activeTab === "admin" ? "Admin" : "Petugas"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#FAF0ED] text-[11px] text-[#7D7075] flex items-center justify-between">
              <span>Contoh login cepat:</span>
              <span className="font-mono font-semibold text-[#9B3B3B]">
                {activeTab === "admin" ? "admin / admin123" : "petugas / petugas123"}
              </span>
            </div>
          </form>

        </div>

      </div>
    </main>
  );
}