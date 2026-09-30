"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UserPlus, Lock, User, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPetugasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({ nama: "Administrator", username: "admin", role: "admin" });
  
  // Form states
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Existing Petugas list
  const [existingPetugas, setExistingPetugas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== "admin") {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!nama.trim() || !username.trim() || !password) {
      setErrorMsg("Semua bidang bertanda bintang (*) wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (password.length < 4) {
      setErrorMsg("Password minimal 4 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          username: username.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal meregistrasi akun Petugas");
      }

      setSuccessMsg(data.message || "Akun Petugas berhasil dibuat.");
      setNama("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat membuat akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="admin" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Registrasi Akun Petugas"
          subtitle="Form pembuatan akun Petugas Kasir baru oleh Administrator."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F5ECE5] mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF0ED] text-[#9B3B3B] flex items-center justify-center border border-[#F0D5CE]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#272023]">Buat Akun Petugas Baru</h2>
                <p className="text-xs text-[#695E63]">Role otomatis diset sebagai "Petugas" dengan enkripsi password bcrypt.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38] text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-[#E3F2ED] border border-[#A7DEC9] text-[#1F6B58] text-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                  Nama Lengkap Petugas <span className="text-[#9B3B3B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Rina Melati"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm font-semibold text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                  Username Akun <span className="text-[#9B3B3B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: rina_kasir"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                    Password <span className="text-[#9B3B3B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1.5 uppercase tracking-wider">
                    Konfirmasi Password <span className="text-[#9B3B3B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Role Info Badge */}
              <div className="p-3.5 rounded-xl bg-[#FAF0ED] border border-[#F0D5CE] text-xs text-[#695E63] flex items-center justify-between">
                <span>Role yang diberikan:</span>
                <span className="font-bold uppercase tracking-wider text-[#9B3B3B] bg-white px-3 py-1 rounded-full border border-[#F0D5CE]">
                  💼 Petugas
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#9B3B3B] text-white font-bold text-sm hover:bg-[#833131] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? "Mendaftarkan Akun..." : "Daftarkan Petugas Baru"}</span>
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>
    </div>
  );
}
