"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReceiptModal from "@/components/ReceiptModal";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  Search,
  Calendar,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
} from "lucide-react";

interface TransactionHeader {
  id: number;
  invoice_number: string;
  petugas_name: string;
  member_name: string;
  total: number;
  bayar: number;
  kembalian: number;
  tanggal: string;
}

interface StockLog {
  id: number;
  product_id: number;
  user_id: number | null;
  nama_barang: string;
  tipe: "masuk" | "keluar";
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string;
  created_at: string;
  nama_user: string;
  username_user: string;
}

export default function TransactionsPage() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  const [transactions, setTransactions] = useState<TransactionHeader[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingStockLogs, setLoadingStockLogs] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Detail / Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Nama petugas yang sedang bertugas
  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  // =========================
  // AMBIL DATA TRANSAKSI
  // =========================
  const fetchTransactions = async () => {
    setLoading(true);

    try {
      let url = "/api/transactions?";

      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }

      if (startDate) {
        url += `startDate=${encodeURIComponent(startDate)}&`;
      }

      if (endDate) {
        url += `endDate=${encodeURIComponent(endDate)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AMBIL AKTIVITAS STOK
  // =========================
  const fetchStockLogs = async () => {
    setLoadingStockLogs(true);

    try {
      const res = await fetch("/api/stock/logs", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setStockLogs(data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil aktivitas stok:", error);
    } finally {
      setLoadingStockLogs(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, startDate, endDate]);

  useEffect(() => {
    fetchStockLogs();
  }, []);

  // =========================
  // LIHAT DETAIL TRANSAKSI
  // =========================
  const handleViewDetail = async (trxId: number) => {
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/transactions/${trxId}`);
      const data = await res.json();

      if (res.ok && data.data) {
        setSelectedReceipt(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail transaksi:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // =========================
  // RESET FILTER
  // =========================
  const handleResetFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  // =========================
  // FORMAT TANGGAL STOK
  // =========================
  const formatStockDate = (date: string) => {
    try {
      return formatDate(date);
    } catch {
      return date;
    }
  };

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
          title="Riwayat Transaksi"
          subtitle="Arsip transaksi penjualan dan aktivitas perubahan stok barang."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* SEARCH & DATE FILTERS */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

            {/* SEARCH */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />

              <input
                type="text"
                placeholder="Cari invoice, petugas, atau member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
              />
            </div>

            {/* DATE FILTER */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">

              {/* DARI */}
              <div className="flex items-center gap-2 bg-[#FAF5EF] border border-[#EADFD5] px-3 py-1.5 rounded-xl text-xs">

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
              <div className="flex items-center gap-2 bg-[#FAF5EF] border border-[#EADFD5] px-3 py-1.5 rounded-xl text-xs">

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

              {/* RESET */}
              {(startDate || endDate || search) && (
                <button
                  onClick={handleResetFilter}
                  className="px-3 py-2 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#9B3B3B] hover:bg-[#FAF0ED]"
                >
                  Reset Filter
                </button>
              )}

            </div>
          </div>

          {/* ==========================================
              TABLE TRANSAKSI PENJUALAN
          ========================================== */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl overflow-x-auto shadow-xs">

            <div className="px-6 py-5 border-b border-[#EADFD5]">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#FAF0ED] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#9B3B3B]" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#272023]">
                    Transaksi Penjualan
                  </h2>

                  <p className="text-xs text-[#8C7E84] mt-0.5">
                    Riwayat transaksi yang dilakukan oleh petugas kasir.
                  </p>
                </div>

              </div>
            </div>

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">

                  <th className="py-4 px-6">
                    ID Invoice
                  </th>

                  <th className="py-4 px-6">
                    Tanggal
                  </th>

                  <th className="py-4 px-6">
                    Petugas
                  </th>

                  <th className="py-4 px-6">
                    Member
                  </th>

                  <th className="py-4 px-6">
                    Total
                  </th>

                  <th className="py-4 px-6">
                    Bayar
                  </th>

                  <th className="py-4 px-6">
                    Kembalian
                  </th>

                  <th className="py-4 px-6 text-center">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5ECE5] text-sm">

                {loading ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Memuat riwayat transaksi...
                    </td>
                  </tr>

                ) : transactions.length === 0 ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Belum ada transaksi sesuai pencarian.
                    </td>
                  </tr>

                ) : (

                  transactions.map((t) => (

                    <tr
                      key={t.id}
                      className="hover:bg-[#FAF0ED]/50 transition-colors"
                    >

                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#9B3B3B]">
                        {t.invoice_number}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#695E63]">
                        {formatDate(t.tanggal)}
                      </td>

                      <td className="py-4 px-6 font-semibold text-[#272023]">
                        {t.petugas_name}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#695E63]">

                        <span className="px-2.5 py-1 rounded-full bg-[#FAF5EF] border border-[#EADFD5] text-[#272023] font-medium">
                          {t.member_name}
                        </span>

                      </td>

                      <td className="py-4 px-6 font-bold text-[#9B3B3B]">
                        {formatRupiah(t.total)}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#695E63]">
                        {formatRupiah(t.bayar)}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#1F6B58] font-semibold">
                        {formatRupiah(t.kembalian)}
                      </td>

                      <td className="py-4 px-6 text-center">

                        <button
                          onClick={() => handleViewDetail(t.id)}
                          disabled={loadingDetail}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF0ED] text-[#9B3B3B] border border-[#F0D5CE] hover:bg-[#9B3B3B] hover:text-white transition-colors text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />

                          <span>
                            {loadingDetail
                              ? "Memuat..."
                              : "Lihat Detail"}
                          </span>
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>
          </div>

          {/* ==========================================
              AKTIVITAS PERUBAHAN STOK
          ========================================== */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl overflow-x-auto shadow-xs">

            {/* HEADER AKTIVITAS STOK */}
            <div className="px-6 py-5 border-b border-[#EADFD5]">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#806B45]" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#272023]">
                    Aktivitas Perubahan Stok
                  </h2>

                  <p className="text-xs text-[#8C7E84] mt-0.5">
                    Riwayat stok masuk dan keluar yang dilakukan oleh admin.
                  </p>
                </div>

              </div>

            </div>

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">

                  <th className="py-4 px-6">
                    Waktu
                  </th>

                  <th className="py-4 px-6">
                    Barang
                  </th>

                  <th className="py-4 px-6">
                    Aktivitas
                  </th>

                  <th className="py-4 px-6">
                    Jumlah
                  </th>

                  <th className="py-4 px-6">
                    Stok
                  </th>

                  <th className="py-4 px-6">
                    Dilakukan Oleh
                  </th>

                  <th className="py-4 px-6">
                    Catatan
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5ECE5] text-sm">

                {loadingStockLogs ? (

                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Memuat aktivitas stok...
                    </td>
                  </tr>

                ) : stockLogs.length === 0 ? (

                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Belum ada aktivitas perubahan stok.
                    </td>
                  </tr>

                ) : (

                  stockLogs.map((log) => (

                    <tr
                      key={log.id}
                      className="hover:bg-[#FAF0ED]/50 transition-colors"
                    >

                      {/* WAKTU */}
                      <td className="py-4 px-6 text-xs text-[#695E63] whitespace-nowrap">
                        {formatStockDate(log.created_at)}
                      </td>

                      {/* BARANG */}
                      <td className="py-4 px-6 font-semibold text-[#272023]">
                        {log.nama_barang}
                      </td>

                      {/* AKTIVITAS */}
                      <td className="py-4 px-6">

                        {log.tipe === "masuk" ? (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF6F1] border border-[#CBE9DD] text-[#1F6B58] text-xs font-bold">
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            Stok Masuk
                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF0ED] border border-[#F0D5CE] text-[#9B3B3B] text-xs font-bold">
                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                            Stok Keluar
                          </span>

                        )}

                      </td>

                      {/* JUMLAH */}
                      <td className="py-4 px-6 font-bold text-[#272023]">
                        {log.tipe === "masuk" ? "+" : "-"}
                        {log.jumlah}
                      </td>

                      {/* STOK */}
                      <td className="py-4 px-6 text-xs text-[#695E63] whitespace-nowrap">

                        <span className="font-semibold text-[#272023]">
                          {log.stok_sebelum}
                        </span>

                        <span className="mx-2 text-[#B7A9A0]">
                          →
                        </span>

                        <span
                          className={`font-bold ${
                            log.tipe === "masuk"
                              ? "text-[#1F6B58]"
                              : "text-[#9B3B3B]"
                          }`}
                        >
                          {log.stok_sesudah}
                        </span>

                      </td>

                      {/* USER */}
                      <td className="py-4 px-6">

                        <div className="flex flex-col">

                          <span className="font-semibold text-[#272023] text-xs">
                            {log.nama_user || "Administrator"}
                          </span>

                          <span className="text-[11px] text-[#8C7E84]">
                            @{log.username_user || "admin"}
                          </span>

                        </div>

                      </td>

                      {/* CATATAN */}
                      <td className="py-4 px-6 text-xs text-[#695E63] min-w-[180px]">
                        {log.catatan || "-"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>
          </div>

        </main>
      </div>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

    </div>
  );
}