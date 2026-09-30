"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatRupiah, formatShortDate } from "@/lib/utils";
import { FlowerIcon } from "@/components/FloralDecor";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Receipt,
  PlusCircle,
  Boxes,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>({ nama: "Administrator", username: "admin", role: "admin" });
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableStock: 0,
    lowStock: 0,
    totalTransactions: 0,
  });

  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch user session
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        // Fetch products for stats
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const pData = await prodRes.json();
          const list = pData.data || [];
          setRecentProducts(list.slice(0, 5));

          const total = list.length;
          const low = list.filter((p: any) => p.stok > 0 && p.stok <= 15).length;
          const avail = list.filter((p: any) => p.stok > 0).length;

          setStats((prev) => ({
            ...prev,
            totalProducts: total,
            availableStock: avail,
            lowStock: low,
          }));
        }

        // Fetch transactions count
        const trxRes = await fetch("/api/transactions");
        if (trxRes.ok) {
          const tData = await trxRes.json();
          const tList = tData.data || [];
          setStats((prev) => ({
            ...prev,
            totalTransactions: tList.length,
          }));
        }

        // Fetch stock audit logs for recent activity
        const logsRes = await fetch("/api/stock/logs");
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setRecentActivities((lData.data || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="admin" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Dashboard Admin"
          subtitle="Ringkasan performa toko, ketersediaan stok, dan aktivitas terkini."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1: Total Barang */}
            <div className="editorial-card p-6 rounded-3xl relative overflow-hidden group hover:border-[#9B3B3B]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075]">
                  Jumlah Barang
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FAF0ED] text-[#9B3B3B] flex items-center justify-center border border-[#F0D5CE]">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-[#272023]">
                  {loading ? "..." : stats.totalProducts}
                </span>
                <span className="text-xs text-[#695E63] font-medium">Jenis produk</span>
              </div>
              <div className="mt-3 text-[11px] text-[#8C7E84] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#9B3B3B]" />
                <span>Terdaftar dalam sistem</span>
              </div>
            </div>

            {/* Stat 2: Stok Tersedia */}
            <div className="editorial-card p-6 rounded-3xl relative overflow-hidden group hover:border-[#1F6B58]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075]">
                  Stok Tersedia
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#E3F2ED] text-[#1F6B58] flex items-center justify-center border border-[#A7DEC9]">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-[#272023]">
                  {loading ? "..." : stats.availableStock}
                </span>
                <span className="text-xs text-[#1F6B58] font-semibold">Siap dijual</span>
              </div>
              <div className="mt-3 text-[11px] text-[#7D7075]">Status stok aman di gudang</div>
            </div>

            {/* Stat 3: Stok Menipis */}
            <div className="editorial-card-rose p-6 rounded-3xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9B3B3B]">
                  Stok Menipis
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FDEAE4] text-[#A8442A] flex items-center justify-center border border-[#F4B2B6]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-[#A8442A]">
                  {loading ? "..." : stats.lowStock}
                </span>
                <span className="text-xs text-[#A8442A] font-bold">Produk (≤15)</span>
              </div>
              <div className="mt-3 text-[11px] text-[#A8442A] font-medium flex items-center gap-1">
                <span>Perlu di-restok segera</span>
              </div>
            </div>

            {/* Stat 4: Total Transaksi */}
            <div className="editorial-card-purple p-6 rounded-3xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F3CECE]">
                  Total Transaksi
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF]/20 text-[#FAF5EF] flex items-center justify-center border border-white/20">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-white">
                  {loading ? "..." : stats.totalTransactions}
                </span>
                <span className="text-xs text-[#F3CECE]">Tercatat</span>
              </div>
              <div className="mt-3 text-[11px] text-[#E0D0DC]">Total riwayat penjualan</div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FlowerIcon className="w-5 h-5 text-[#9B3B3B]" />
                <h2 className="font-serif text-xl font-bold text-[#272023]">Aksi Cepat Admin</h2>
              </div>
              <span className="text-xs text-[#7D7075]">Pintasan menu manajemen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                href="/admin/products"
                className="p-4 rounded-2xl bg-[#FAF0ED] border border-[#F0D5CE] hover:bg-[#F3CECE]/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9B3B3B] text-white flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#272023]">Tambah Barang Baru</h3>
                    <p className="text-[11px] text-[#695E63]">Input produk baru ke katalog</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9B3B3B] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/update-stok"
                className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5] hover:bg-[#E5F0F2] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3D707E] text-white flex items-center justify-center">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#272023]">Update Stok Barang</h3>
                    <p className="text-[11px] text-[#695E63]">Tambah/kurangi kuantitas stok</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#3D707E] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/petugas/reports"
                className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5] hover:bg-[#FAF0ED] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4E4663] text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#272023]">Lihat Laporan Penjualan</h3>
                    <p className="text-[11px] text-[#695E63]">Analisis omzet & produk laris</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4E4663] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* TWO COLUMN CONTENT: RINGKASAN BARANG & AKTIVITAS TERBARU */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* RINGKASAN BARANG TERBARU (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5ECE5]">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#272023]">Ringkasan Barang Terbaru</h2>
                    <p className="text-xs text-[#695E63]">Produk yang baru terdaftar dalam sistem</p>
                  </div>
                  <Link
                    href="/admin/products"
                    className="text-xs font-bold text-[#9B3B3B] hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs text-[#8C7E84]">Memuat barang...</div>
                ) : recentProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8C7E84]">Belum ada data barang.</div>
                ) : (
                  <div className="divide-y divide-[#F5ECE5]">
                    {recentProducts.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-[#272023]">{p.nama_barang}</p>
                          <span className="text-xs text-[#7D7075] bg-[#FAF5EF] px-2 py-0.5 rounded-full border border-[#EADFD5] inline-block mt-0.5">
                            {p.kategori}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-[#9B3B3B]">{formatRupiah(p.harga)}</p>
                          <p className="text-xs text-[#695E63]">Stok: <span className="font-bold text-[#272023]">{p.stok}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AKTIVITAS TERBARU (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5ECE5]">
                <Clock className="w-5 h-5 text-[#4E4663]" />
                <h2 className="font-serif text-xl font-bold text-[#272023]">Aktivitas Stok Terbaru</h2>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-[#8C7E84]">Memuat aktivitas...</div>
              ) : recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8C7E84]">Belum ada riwayat stok.</div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="p-3 rounded-2xl bg-[#FAF5EF] border border-[#EADFD5] text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#272023]">{act.nama_barang}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          act.tipe === 'masuk' 
                            ? 'bg-[#E3F2ED] text-[#1F6B58] border border-[#A7DEC9]' 
                            : 'bg-[#FDEAE4] text-[#A8442A] border border-[#F4B2B6]'
                        }`}>
                          {act.tipe === 'masuk' ? `+${act.jumlah} Masuk` : `-${act.jumlah} Keluar`}
                        </span>
                      </div>
                      <p className="text-[#7D7075] mt-1">{act.catatan || "Penyesuaian stok"}</p>
                      <p className="text-[10px] text-[#9E9096] mt-1 text-right">{formatShortDate(act.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
