"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatRupiah } from "@/lib/utils";
import { Calendar, Printer, TrendingUp, Trophy } from "lucide-react";

export default function ReportsPage() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  // Date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);

  const [reportData, setReportData] = useState<any>({
    total_transactions: 0,
    total_revenue: 0,
    total_items_sold: 0,
    top_products: [],
    category_summary: [],
  });

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
      }
    }

    loadUser();
  }, []);

  // Nama petugas yang ditampilkan
  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  // =========================
  // AMBIL DATA LAPORAN
  // =========================
  const fetchReports = async () => {
    setLoading(true);

    try {
      let url = "/api/reports?";

      if (startDate) {
        url += `startDate=${encodeURIComponent(startDate)}&`;
      }

      if (endDate) {
        url += `endDate=${encodeURIComponent(endDate)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.data) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  // =========================
  // CETAK LAPORAN
  // =========================
  const handlePrint = () => {
    window.print();
  };

  const topSeller =
    reportData.top_products && reportData.top_products[0];

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">

      {/* SIDEBAR */}
      <Sidebar
        userRole={user.role || "petugas"}
        userName={displayName}
        userUsername={user.username}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* HEADER */}
        <Header
          title="Laporan Penjualan & Analytics"
          subtitle="Ringkasan omzet, analisis produk terlaris, dan ekspor laporan cetak."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* TOOLBAR */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">

            <div className="flex flex-wrap items-center gap-3">

              {/* DARI */}
              <div className="flex items-center gap-2 bg-[#FAF5EF] border border-[#EADFD5] px-3.5 py-2 rounded-xl text-xs">

                <Calendar className="w-3.5 h-3.5 text-[#9B3B3B]" />

                <span className="text-[#7D7075] font-bold">
                  Dari:
                </span>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[#272023] font-medium focus:outline-none"
                />

              </div>

              {/* SAMPAI */}
              <div className="flex items-center gap-2 bg-[#FAF5EF] border border-[#EADFD5] px-3.5 py-2 rounded-xl text-xs">

                <Calendar className="w-3.5 h-3.5 text-[#9B3B3B]" />

                <span className="text-[#7D7075] font-bold">
                  Sampai:
                </span>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[#272023] font-medium focus:outline-none"
                />

              </div>

              {/* GENERATE */}
              <button
                onClick={fetchReports}
                className="px-4 py-2 rounded-xl bg-[#4E4663] text-white text-xs font-bold hover:bg-[#3B344D] transition-colors shadow-xs"
              >
                Generate Laporan
              </button>

            </div>

            {/* CETAK */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9B3B3B] text-white text-xs font-bold hover:bg-[#833131] transition-all shadow-md shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>

          </div>

          {/* KEY PERFORMANCE METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* TOTAL PENDAPATAN */}
            <div className="editorial-card-rose p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#9B3B3B] block">
                Total Pendapatan
              </span>

              <span className="font-serif text-3xl font-bold text-[#272023] mt-2 block">
                {loading
                  ? "..."
                  : formatRupiah(reportData.total_revenue)}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Bruto hasil penjualan
              </span>

            </div>

            {/* TOTAL TRANSAKSI */}
            <div className="editorial-card p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075] block">
                Total Transaksi
              </span>

              <span className="font-serif text-4xl font-bold text-[#4E4663] mt-2 block">
                {loading
                  ? "..."
                  : reportData.total_transactions}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Nota telah diproses
              </span>

            </div>

            {/* PRODUK TERJUAL */}
            <div className="editorial-card p-6 rounded-3xl">

              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7075] block">
                Produk Terjual
              </span>

              <span className="font-serif text-4xl font-bold text-[#3D707E] mt-2 block">
                {loading
                  ? "..."
                  : reportData.total_items_sold}
              </span>

              <span className="text-xs text-[#695E63] mt-1 block">
                Unit barang terjual
              </span>

            </div>

            {/* PRODUK TERLARIS */}
            <div className="editorial-card p-6 rounded-3xl bg-[#FAF5EF]">

              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B3B3B]">

                <Trophy className="w-4 h-4 text-[#9B3B3B]" />

                <span>
                  Produk Terlaris
                </span>

              </div>

              <span className="font-serif text-lg font-bold text-[#272023] mt-2 block truncate">
                {loading
                  ? "..."
                  : topSeller
                  ? topSeller.nama_barang
                  : "-"}
              </span>

              <span className="text-xs text-[#1F6B58] font-bold mt-1 block">
                {topSeller
                  ? `${topSeller.total_qty} unit (${formatRupiah(
                      topSeller.total_sales
                    )})`
                  : "Belum ada data"}
              </span>

            </div>

          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* KATEGORI */}
            <div className="lg:col-span-5 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs">

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5ECE5]">

                <TrendingUp className="w-5 h-5 text-[#9B3B3B]" />

                <h2 className="font-serif text-xl font-bold text-[#272023]">
                  Proporsi Omzet Kategori
                </h2>

              </div>

              {loading ? (

                <p className="py-8 text-center text-xs text-[#8C7E84]">
                  Memuat data grafik...
                </p>

              ) : reportData.category_summary.length === 0 ? (

                <p className="py-8 text-center text-xs text-[#8C7E84]">
                  Belum ada penjualan dalam periode ini.
                </p>

              ) : (

                <div className="space-y-4 pt-2">

                  {reportData.category_summary.map(
                    (cat: any, idx: number) => {

                      const maxSales =
                        Math.max(
                          ...reportData.category_summary.map(
                            (c: any) => c.total_sales
                          )
                        ) || 1;

                      const pct = Math.round(
                        (cat.total_sales / maxSales) * 100
                      );

                      const colors = [
                        {
                          bg: "bg-[#9B3B3B]",
                          label: "text-[#9B3B3B]",
                        },
                        {
                          bg: "bg-[#3D707E]",
                          label: "text-[#3D707E]",
                        },
                        {
                          bg: "bg-[#4E4663]",
                          label: "text-[#4E4663]",
                        },
                        {
                          bg: "bg-[#1F6B58]",
                          label: "text-[#1F6B58]",
                        },
                      ];

                      const color =
                        colors[idx % colors.length];

                      return (
                        <div
                          key={cat.kategori}
                          className="space-y-1"
                        >

                          <div className="flex justify-between text-xs font-bold">

                            <span className="text-[#272023]">
                              {cat.kategori} ({cat.total_qty} unit)
                            </span>

                            <span className={color.label}>
                              {formatRupiah(cat.total_sales)}
                            </span>

                          </div>

                          <div className="w-full bg-[#FAF5EF] rounded-full h-3 border border-[#EADFD5] overflow-hidden">

                            <div
                              className={`h-full ${color.bg} transition-all duration-500 rounded-full`}
                              style={{
                                width: `${pct}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

            {/* TOP 5 PRODUK */}
            <div className="lg:col-span-7 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs">

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5ECE5]">

                <Trophy className="w-5 h-5 text-[#3D707E]" />

                <h2 className="font-serif text-xl font-bold text-[#272023]">
                  Ringkasan Top 5 Produk Terlaris
                </h2>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse text-xs">

                  <thead>

                    <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">

                      <th className="py-3 px-4">
                        Peringkat
                      </th>

                      <th className="py-3 px-4">
                        Nama Produk
                      </th>

                      <th className="py-3 px-4">
                        Kategori
                      </th>

                      <th className="py-3 px-4">
                        Terjual
                      </th>

                      <th className="py-3 px-4">
                        Total Subtotal
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-[#F5ECE5]">

                    {loading ? (

                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-[#8C7E84]"
                        >
                          Memuat...
                        </td>
                      </tr>

                    ) : reportData.top_products.length === 0 ? (

                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-[#8C7E84]"
                        >
                          Belum ada data.
                        </td>
                      </tr>

                    ) : (

                      reportData.top_products.map(
                        (p: any, idx: number) => (

                          <tr
                            key={p.nama_barang}
                            className="hover:bg-[#FAF5EF]"
                          >

                            <td className="py-3 px-4 font-mono font-bold text-[#9B3B3B]">
                              #{idx + 1}
                            </td>

                            <td className="py-3 px-4 font-bold text-[#272023]">
                              {p.nama_barang}
                            </td>

                            <td className="py-3 px-4">

                              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EF] border border-[#EADFD5] text-[#695E63]">
                                {p.kategori}
                              </span>

                            </td>

                            <td className="py-3 px-4 font-bold text-[#272023]">
                              {p.total_qty} unit
                            </td>

                            <td className="py-3 px-4 font-bold text-[#9B3B3B]">
                              {formatRupiah(p.total_sales)}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}