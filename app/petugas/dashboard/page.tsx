"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatRupiah, formatShortDate } from "@/lib/utils";
import { ShoppingCart, Users, Receipt, FileText, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PetugasDashboard() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  const [loading, setLoading] = useState(true);

  const [shiftStats, setShiftStats] = useState({
    todayTransactions: 0,
    todayRevenue: 0,
    memberCount: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // =========================
        // AMBIL SESSION USER
        // =========================
        const meRes = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (meRes.ok) {
          const meData = await meRes.json();

          if (meData.user) {
            setUser(meData.user);
          }
        }

        // =========================
        // TRANSACTIONS
        // =========================
        const trxRes = await fetch("/api/transactions", {
          cache: "no-store",
        });

        if (trxRes.ok) {
          const tData = await trxRes.json();
          const list = tData.data || [];

          setRecentTransactions(list.slice(0, 5));

          const todayStr = new Date()
            .toISOString()
            .slice(0, 10);

          const todayTrxs = list.filter(
            (t: any) =>
              String(t.tanggal).slice(0, 10) === todayStr
          );

          const rev = todayTrxs.reduce(
            (sum: number, t: any) =>
              sum + Number(t.total),
            0
          );

          setShiftStats((prev) => ({
            ...prev,
            todayTransactions: todayTrxs.length,
            todayRevenue: rev,
          }));
        }

        // =========================
        // MEMBERS
        // =========================
        const memRes = await fetch("/api/members", {
          cache: "no-store",
        });

        if (memRes.ok) {
          const mData = await memRes.json();

          setShiftStats((prev) => ({
            ...prev,
            memberCount: (mData.data || []).length,
          }));
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Nama yang sedang bertugas
  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">

      {/* =========================
          SIDEBAR
      ========================= */}
      <Sidebar
        userRole="petugas"
        userName={displayName}
        userUsername={user.username}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* =========================
            HEADER
        ========================= */}
        <Header
          title="Dashboard Kasir"
          subtitle="Selamat bertugas! Kelola transaksi kasir, pendaftaran member, dan laporan."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* =========================
              HERO
          ========================= */}
          <div className="editorial-card-purple p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">

            <div className="space-y-2 relative z-10 max-w-xl">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EF]/20 border border-white/20 text-xs font-semibold text-[#F3CECE]">

                <Sparkles className="w-3.5 h-3.5 text-[#F3CECE]" />

                <span>Kasir Active Shift</span>

              </div>

              <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
                Siap Melayani Pelanggan?
              </h2>

              <p className="text-xs text-[#E0D0DC] leading-relaxed">
                Buka terminal Kasir / Point of Sale untuk memproses barang
                belanjaan, memilih member, dan mencetak struk transaksi secara
                langsung.
              </p>

            </div>

            <Link
              href="/petugas/kasir"
              className="px-6 py-4 rounded-2xl bg-[#9B3B3B] text-white font-bold text-sm hover:bg-[#B54848] transition-all shadow-lg flex items-center gap-3 shrink-0 relative z-10 group"
            >
              <ShoppingCart className="w-5 h-5 text-[#F3CECE]" />

              <span>Buka Terminal Kasir / POS</span>

              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>

          {/* =========================
              STATS
          ========================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div className="editorial-card p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075] block">
                Transaksi Hari Ini
              </span>

              <span className="font-serif text-4xl font-bold text-[#9B3B3B] mt-2 block">
                {loading
                  ? "..."
                  : shiftStats.todayTransactions}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Nota telah diproses hari ini
              </span>

            </div>

            <div className="editorial-card p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075] block">
                Pendapatan Hari Ini
              </span>

              <span className="font-serif text-3xl font-bold text-[#1F6B58] mt-2 block">
                {loading
                  ? "..."
                  : formatRupiah(
                      shiftStats.todayRevenue
                    )}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Total cash/tunai diterima
              </span>

            </div>

            <div className="editorial-card p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075] block">
                Member Terdaftar
              </span>

              <span className="font-serif text-4xl font-bold text-[#3D707E] mt-2 block">
                {loading
                  ? "..."
                  : shiftStats.memberCount}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Pelanggan terdaftar
              </span>

            </div>

          </div>

          {/* =========================
              QUICK LINKS
          ========================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <Link
              href="/petugas/members"
              className="p-6 rounded-3xl bg-white border border-[#EADFD5] hover:border-[#3D707E] transition-all shadow-xs group"
            >

              <div className="w-12 h-12 rounded-2xl bg-[#E5F0F2] text-[#3D707E] flex items-center justify-center mb-4 border border-[#CDE1E5]">
                <Users className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#272023] group-hover:text-[#3D707E]">
                Data Member
              </h3>

              <p className="text-xs text-[#695E63] mt-1">
                Kelola daftar pelanggan, alamat, dan kontak telepon.
              </p>

            </Link>

            <Link
              href="/petugas/transactions"
              className="p-6 rounded-3xl bg-white border border-[#EADFD5] hover:border-[#4E4663] transition-all shadow-xs group"
            >

              <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] text-[#4E4663] flex items-center justify-center mb-4 border border-[#EADFD5]">
                <Receipt className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#272023] group-hover:text-[#4E4663]">
                Riwayat Transaksi
              </h3>

              <p className="text-xs text-[#695E63] mt-1">
                Cari invoice transaksi lama & cetak ulang struk.
              </p>

            </Link>

            <Link
              href="/petugas/reports"
              className="p-6 rounded-3xl bg-white border border-[#EADFD5] hover:border-[#9B3B3B] transition-all shadow-xs group"
            >

              <div className="w-12 h-12 rounded-2xl bg-[#FAF0ED] text-[#9B3B3B] flex items-center justify-center mb-4 border border-[#F0D5CE]">
                <FileText className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#272023] group-hover:text-[#9B3B3B]">
                Laporan Penjualan
              </h3>

              <p className="text-xs text-[#695E63] mt-1">
                Ringkasan omzet, filter tanggal, & cetak laporan shift.
              </p>

            </Link>

          </div>

          {/* =========================
              RECENT TRANSACTIONS
          ========================= */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs">

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5ECE5]">

              <div>

                <h3 className="font-serif text-xl font-bold text-[#272023]">
                  Transaksi Terakhir
                </h3>

                <p className="text-xs text-[#695E63]">
                  Invoice belanjaan yang baru diproses
                </p>

              </div>

              <Link
                href="/petugas/transactions"
                className="text-xs font-bold text-[#9B3B3B] hover:underline flex items-center gap-1"
              >

                <span>Lihat Selengkapnya</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>

            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-[#8C7E84]">
                Memuat transaksi...
              </p>
            ) : recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8C7E84]">
                Belum ada transaksi hari ini.
              </p>
            ) : (
              <div className="divide-y divide-[#F5ECE5] text-xs">

                {recentTransactions.map((trx) => (

                  <div
                    key={trx.id}
                    className="py-3 flex items-center justify-between"
                  >

                    <div>

                      <span className="font-mono font-bold text-[#272023]">
                        {trx.invoice_number}
                      </span>

                      <p className="text-[#7D7075] text-[11px] mt-0.5">
                        Member:{" "}
                        <span className="font-medium text-[#272023]">
                          {trx.member_name}
                        </span>
                      </p>

                    </div>

                    <div className="text-right">

                      <span className="font-bold text-sm text-[#9B3B3B] block">
                        {formatRupiah(trx.total)}
                      </span>

                      <span className="text-[10px] text-[#9E9096]">
                        {formatShortDate(trx.tanggal)}
                      </span>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}