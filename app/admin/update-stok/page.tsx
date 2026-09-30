"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatShortDate } from "@/lib/utils";
import { Boxes, Search, PlusCircle, MinusCircle, History, Save, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Product {
  id: number;
  nama_barang: string;
  harga: number;
  stok: number;
  kategori: string;
  status: string;
}

interface StockLog {
  id: number;
  product_id: number;
  nama_barang: string;
  tipe: "masuk" | "keluar";
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string;
  created_at: string;
}

export default function UpdateStokPage() {
  const [user, setUser] = useState<any>({ nama: "Administrator", username: "admin", role: "admin" });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  const [search, setSearch] = useState("");
  const [changeType, setChangeType] = useState<"masuk" | "keluar">("masuk");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
        if (selectedProduct) {
          const updated = (data.data || []).find((p: Product) => p.id === selectedProduct.id);
          if (updated) setSelectedProduct(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/stock/logs");
      const data = await res.json();
      if (res.ok) {
        setStockLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!selectedProduct) {
      setMessage({ type: "error", text: "Silakan pilih barang terlebih dahulu." });
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setMessage({ type: "error", text: "Jumlah perubahan stok harus berupa angka lebih besar dari 0." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          tipe: changeType,
          jumlah: qtyNum,
          catatan: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui stok");

      setMessage({ type: "success", text: data.message });
      setQuantity("");
      setNotes("");
      fetchProducts();
      fetchLogs();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="admin" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Update Stok Barang"
          subtitle="Form penyesuaian stok masuk dan keluar beserta log riwayat audit stok."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* TWO COLUMN GRID: PRODUCT SELECTOR & STOCK UPDATE FORM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: PRODUCT SEARCH & SELECTOR (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col h-[520px]">
              <h2 className="font-serif text-xl font-bold text-[#272023] mb-3">Pilih Barang</h2>
              
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {loading ? (
                  <p className="text-center text-xs text-[#8C7E84] py-8">Memuat barang...</p>
                ) : products.length === 0 ? (
                  <p className="text-center text-xs text-[#8C7E84] py-8">Barang tidak ditemukan.</p>
                ) : (
                  products.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#FAF0ED] border-[#9B3B3B] shadow-xs"
                            : "bg-white border-[#EADFD5] hover:bg-[#FAF5EF]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-[#272023]">{p.nama_barang}</p>
                            <p className="text-xs text-[#7D7075]">{p.kategori}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm text-[#4E4663] block">{p.stok} unit</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              p.status === "Habis"
                                ? "bg-[#FBE6E8] text-[#9E2A38]"
                                : p.status === "Stok Menipis"
                                ? "bg-[#FDEAE4] text-[#A8442A]"
                                : "bg-[#E3F2ED] text-[#1F6B58]"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: UPDATE FORM (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5ECE5]">
                  <Boxes className="w-5 h-5 text-[#3D707E]" />
                  <h2 className="font-serif text-xl font-bold text-[#272023]">Form Perubahan Stok</h2>
                </div>

                {message.text && (
                  <div className={`mb-4 p-4 rounded-2xl text-xs flex items-center gap-3 ${
                    message.type === "success" 
                      ? "bg-[#E3F2ED] border border-[#A7DEC9] text-[#1F6B58]" 
                      : "bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38]"
                  }`}>
                    {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                )}

                {selectedProduct ? (
                  <div className="p-4 rounded-2xl bg-[#FAF0ED] border border-[#F0D5CE] mb-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B3B3B] block">Barang Terpilih</span>
                      <h3 className="font-serif text-lg font-bold text-[#272023]">{selectedProduct.nama_barang}</h3>
                      <p className="text-xs text-[#695E63]">Kategori: {selectedProduct.kategori}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#7D7075] block">Stok Saat Ini:</span>
                      <span className="font-serif text-3xl font-bold text-[#9B3B3B]">{selectedProduct.stok}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF5EF] border border-dashed border-[#CBA59C] text-center text-xs text-[#8C7E84] mb-6">
                    ← Pilih barang terlebih dahulu dari daftar di sebelah kiri.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipe Perubahan */}
                  <div>
                    <label className="block text-xs font-bold text-[#272023] mb-2 uppercase tracking-wider">
                      Jenis Perubahan Stok
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setChangeType("masuk")}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          changeType === "masuk"
                            ? "bg-[#E3F2ED] border-[#A7DEC9] text-[#1F6B58] shadow-xs"
                            : "bg-[#FAF5EF] border-[#EADFD5] text-[#695E63]"
                        }`}
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Tambah Stok (Masuk)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChangeType("keluar")}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          changeType === "keluar"
                            ? "bg-[#FDEAE4] border-[#F4B2B6] text-[#A8442A] shadow-xs"
                            : "bg-[#FAF5EF] border-[#EADFD5] text-[#695E63]"
                        }`}
                      >
                        <MinusCircle className="w-4 h-4" />
                        <span>Kurangi Stok (Keluar)</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Jumlah */}
                  <div>
                    <label className="block text-xs font-bold text-[#272023] mb-1 uppercase tracking-wider">
                      Jumlah Kuantitas
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Masukkan unit (contoh: 10)"
                      className="w-full px-4 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm font-bold text-[#272023] focus:outline-none focus:border-[#3D707E]"
                    />
                  </div>

                  {/* Input Catatan */}
                  <div>
                    <label className="block text-xs font-bold text-[#272023] mb-1 uppercase tracking-wider">
                      Catatan Perubahan
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Restok mingguan distributor / Penyesuaian barang kedaluwarsa..."
                      className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-xs text-[#272023] focus:outline-none focus:border-[#3D707E]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !selectedProduct}
                      className="w-full py-3.5 rounded-xl bg-[#3D707E] text-white font-bold text-sm hover:bg-[#2F5864] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan Stok"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* STOCK LOGS HISTORY TABLE */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F5ECE5]">
              <History className="w-5 h-5 text-[#4E4663]" />
              <h2 className="font-serif text-xl font-bold text-[#272023]">Riwayat Audit Perubahan Stok</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Nama Barang</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Jumlah</th>
                    <th className="py-3 px-4">Sebelum → Sesudah</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5ECE5]">
                  {stockLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#8C7E84]">
                        Belum ada riwayat perubahan stok.
                      </td>
                    </tr>
                  ) : (
                    stockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF5EF]">
                        <td className="py-3 px-4 font-mono text-[#7D7075]">
                          {formatShortDate(log.created_at)}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#272023]">
                          {log.nama_barang}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1 ${
                              log.tipe === "masuk"
                                ? "bg-[#E3F2ED] text-[#1F6B58] border border-[#A7DEC9]"
                                : "bg-[#FDEAE4] text-[#A8442A] border border-[#F4B2B6]"
                            }`}
                          >
                            {log.tipe === "masuk" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {log.tipe === "masuk" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#272023]">
                          {log.tipe === "masuk" ? `+${log.jumlah}` : `-${log.jumlah}`} unit
                        </td>
                        <td className="py-3 px-4 font-mono text-[#695E63]">
                          {log.stok_sebelum} → <span className="font-bold text-[#272023]">{log.stok_sesudah}</span>
                        </td>
                        <td className="py-3 px-4 text-[#7D7075] italic">
                          {log.catatan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
