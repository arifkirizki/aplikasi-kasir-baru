"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatRupiah } from "@/lib/utils";
import { Search, Plus, Edit, Trash2, X, AlertCircle, Sparkles, Filter } from "lucide-react";

interface Product {
  id: number;
  nama_barang: string;
  harga: number;
  stok: number;
  kategori: string;
  status: "Tersedia" | "Stok Menipis" | "Habis";
}

export default function AdminProductsPage() {
  const [user, setUser] = useState<any>({ nama: "Administrator", username: "admin", role: "admin" });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formHarga, setFormHarga] = useState("");
  const [formStok, setFormStok] = useState("");
  const [formKategori, setFormKategori] = useState("Makanan");

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Semua", "Makanan", "Minuman", "Dessert", "Lainnya"];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/api/products?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter && categoryFilter !== "Semua") url += `category=${encodeURIComponent(categoryFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error("Fetch products error", err);
    } finally {
      setLoading(false);
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
  }, [search, categoryFilter]);

  const handleOpenAdd = () => {
    setFormNama("");
    setFormHarga("");
    setFormStok("");
    setFormKategori("Makanan");
    setFormError("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setFormNama(p.nama_barang);
    setFormHarga(String(p.harga));
    setFormStok(String(p.stok));
    setFormKategori(p.kategori);
    setFormError("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim() || !formHarga || !formStok || !formKategori) {
      setFormError("Semua bidang wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_barang: formNama,
          harga: Number(formHarga),
          stok: Number(formStok),
          kategori: formKategori,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah barang");

      setIsAddOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setFormError("");

    if (!formNama.trim() || !formHarga || !formStok || !formKategori) {
      setFormError("Semua bidang wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_barang: formNama,
          harga: Number(formHarga),
          stok: Number(formStok),
          kategori: formKategori,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengedit barang");

      setEditProduct(null);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus barang");

      setDeleteProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="admin" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Data Barang"
          subtitle="Kelola katalog produk, harga, dan ketersediaan stok barang toko."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* TOP TOOLBAR: SEARCH, FILTER, AND ADD BUTTON */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
              <input
                type="text"
                placeholder="Cari nama barang atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-colors"
              />
            </div>

            {/* Filter Pills & Add Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 p-1 bg-[#FAF5EF] rounded-2xl border border-[#EADFD5]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      categoryFilter === cat
                        ? "bg-[#4E4663] text-white shadow-xs"
                        : "text-[#695E63] hover:text-[#272023]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9B3B3B] text-white font-bold text-xs hover:bg-[#833131] transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </button>
            </div>

          </div>

          {/* PRODUCT TABLE CARD */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Nama Barang</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Harga</th>
                    <th className="py-4 px-6">Stok</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5ECE5] text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#8C7E84]">
                        Memuat data barang...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#8C7E84]">
                        Tidak ada barang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF0ED]/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-[#8C7E84]">
                          #{p.id}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#272023]">
                          {p.nama_barang}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full bg-[#FAF5EF] border border-[#EADFD5] text-xs text-[#695E63] font-medium">
                            {p.kategori}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#9B3B3B]">
                          {formatRupiah(p.harga)}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#272023]">
                          {p.stok} unit
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              p.status === "Habis"
                                ? "bg-[#FBE6E8] text-[#9E2A38] border border-[#F4B2B6]"
                                : p.status === "Stok Menipis"
                                ? "bg-[#FDEAE4] text-[#A8442A] border border-[#F4B2B6]"
                                : "bg-[#E3F2ED] text-[#1F6B58] border border-[#A7DEC9]"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Barang"
                              className="p-2 rounded-xl bg-[#FAF5EF] text-[#4E4663] hover:bg-[#4E4663] hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              title="Hapus Barang"
                              className="p-2 rounded-xl bg-[#FAF0ED] text-[#9B3B3B] hover:bg-[#9B3B3B] hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* MODAL TAMBAH BARANG */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5ECE5] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#272023]">Tambah Barang Baru</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-[#8C7E84] hover:bg-[#FAF0ED] hover:text-[#9B3B3B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Kopi Caramel Latte"
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formHarga}
                    onChange={(e) => setFormHarga(e.target.value)}
                    placeholder="18000"
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStok}
                    onChange={(e) => setFormStok(e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1">Kategori</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#695E63] hover:bg-[#FAF5EF]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#9B3B3B] text-white font-bold text-xs hover:bg-[#833131] shadow-md disabled:opacity-50"
                >
                  {submitting ? "Simpan..." : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT BARANG */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5ECE5] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#272023]">Edit Barang #{editProduct.id}</h3>
              <button
                onClick={() => setEditProduct(null)}
                className="p-1 rounded-xl text-[#8C7E84] hover:bg-[#FAF0ED] hover:text-[#9B3B3B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formHarga}
                    onChange={(e) => setFormHarga(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#272023] mb-1">Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStok}
                    onChange={(e) => setFormStok(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#272023] mb-1">Kategori</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#695E63] hover:bg-[#FAF5EF]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4E4663] text-white font-bold text-xs hover:bg-[#3B344D] shadow-md disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Update Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FBE6E8] text-[#9E2A38] flex items-center justify-center mx-auto mb-4 border border-[#F4B2B6]">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#272023]">Hapus Barang Ini?</h3>
            <p className="text-xs text-[#695E63] mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-[#272023]">"{deleteProduct.nama_barang}"</span>? Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#695E63] hover:bg-[#FAF5EF]"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#9E2A38] text-white font-bold text-xs hover:bg-[#7D212C] shadow-md disabled:opacity-50"
              >
                {submitting ? "Hapus..." : "Ya, Hapus Barang"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
