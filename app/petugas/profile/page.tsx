"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UserCheck, CheckCircle2 } from "lucide-react";

export default function PetugasProfilePage() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // AMBIL SESSION USER
  // =========================
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Gagal mengambil session:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Nama yang sedang bertugas
  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  // Nama akun asli untuk halaman profil
  const accountName =
    user.nama || "Petugas Kasir";

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">

      {/* SIDEBAR */}
      <Sidebar
        userRole="petugas"
        userName={displayName}
        userUsername={user.username}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* HEADER */}
        <Header
          title="Profil Petugas"
          subtitle="Informasi akun pengguna dan wewenang hak akses petugas kasir."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 max-w-4xl w-full mx-auto space-y-6">

          {/* PROFILE CARD */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-8 shadow-xs relative overflow-hidden">

            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#F5ECE5]">

              {/* AVATAR */}
              <div className="w-20 h-20 rounded-full bg-[#E5F0F2] text-[#3D707E] font-serif font-bold text-3xl flex items-center justify-center border-2 border-[#CDE1E5] shadow-sm">
                {loading
                  ? "P"
                  : accountName
                  ? accountName.charAt(0).toUpperCase()
                  : "P"}
              </div>

              {/* USER INFO */}
              <div className="text-center sm:text-left space-y-1">

                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#9B3B3B] text-white text-[11px] font-bold uppercase tracking-wider">

                  <UserCheck className="w-3.5 h-3.5" />

                  <span>
                    Role: {user.role || "petugas"}
                  </span>

                </div>

                <h2 className="font-serif text-2xl font-bold text-[#272023]">
                  {loading ? "Memuat..." : accountName}
                </h2>

                <p className="text-xs text-[#695E63]">
                  @{user.username || "petugas"}
                </p>

              </div>

            </div>

            {/* DETAIL */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

              {/* STATUS HAK AKSES */}
              <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5]">

                <span className="text-[#7D7075] font-bold block mb-1">
                  Status Hak Akses
                </span>

                <span className="font-bold text-[#1F6B58] flex items-center gap-1">

                  <CheckCircle2 className="w-4 h-4 text-[#1F6B58]" />

                  Petugas Operasional Kasir

                </span>

              </div>

              {/* APLIKASI */}
              <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5]">

                <span className="text-[#7D7075] font-bold block mb-1">
                  Aplikasi
                </span>

                <span className="font-bold text-[#272023]">
                  KasirKu — Aesthetic Editorial POS
                </span>

              </div>

            </div>

            {/* NAMA YANG BERTUGAS */}
            <div className="mt-4 p-4 rounded-2xl bg-[#F8F1F2] border border-[#EADFD5]">

              <span className="text-[#7D7075] font-bold block mb-1">
                Nama Petugas yang Bertugas
              </span>

              <span className="font-bold text-[#9B3B3B]">
                {loading ? "Memuat..." : displayName}
              </span>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}