"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { User, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>({ nama: "Administrator", username: "admin", role: "admin" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="admin" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Profil Pengguna"
          subtitle="Informasi akun pengguna dan wewenang hak akses administrator."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-8 max-w-4xl w-full mx-auto space-y-6">
          
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#F5ECE5]">
              <div className="w-20 h-20 rounded-full bg-[#FAF0ED] text-[#9B3B3B] font-serif font-bold text-3xl flex items-center justify-center border-2 border-[#F0D5CE] shadow-sm">
                {user.nama ? user.nama.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#4E4663] text-white text-[11px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Role: {user.role}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#272023]">{user.nama}</h2>
                <p className="text-xs text-[#695E63]">@{user.username}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5]">
                <span className="text-[#7D7075] font-bold block mb-1">Status Hak Akses</span>
                <span className="font-bold text-[#1F6B58] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6B58]" />
                  Akses Penuh Administrator
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5]">
                <span className="text-[#7D7075] font-bold block mb-1">Aplikasi</span>
                <span className="font-bold text-[#272023]">KasirKu — Aesthetic Editorial POS</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
