"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatRupiah } from "@/lib/utils";
import { Search } from "lucide-react";

interface Product {
  id: number;
  nama_barang: string;
  harga: number;
  stok: number;
  kategori: string;
  status: "Tersedia" | "Stok Menipis" | "Habis";
}

export default function PetugasProductsPage() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const categories = [
    "Semua",
    "Makanan",
    "Minuman",
    "Dessert",
    "Lainnya",
  ];

  // =========================
  // AMBIL DATA USER / SESSION
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

  // Nama yang ditampilkan di Sidebar & Header
  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  // =========================
  // AMBIL DATA PRODUK
  // =========================
  const fetchProducts = async () => {
    setLoading(true);

    try {
      let url = "/api/products?";

      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }

      if (categoryFilter && categoryFilter !== "Semua") {
        url += `category=${encodeURIComponent(categoryFilter)}`;
      }

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
    fetchProducts();
  }, [search, categoryFilter]);

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
          title="Katalog Data Barang"
          subtitle="Daftar produk, status stok, dan harga terkini untuk referensi kasir."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* SEARCH & FILTER */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />

              <input
                type="text"
                placeholder="Cari produk atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#FAF5EF] rounded-2xl border border-[#EADFD5] overflow-x-auto">

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? "bg-[#9B3B3B] text-white shadow-xs"
                      : "text-[#695E63] hover:text-[#272023]"
                  }`}
                >
                  {cat}
                </button>
              ))}

            </div>
          </div>

          {/* TABLE PRODUK */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl overflow-hidden shadow-xs">

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">

                  <th className="py-4 px-6">
                    ID
                  </th>

                  <th className="py-4 px-6">
                    Nama Barang
                  </th>

                  <th className="py-4 px-6">
                    Kategori
                  </th>

                  <th className="py-4 px-6">
                    Harga
                  </th>

                  <th className="py-4 px-6">
                    Stok
                  </th>

                  <th className="py-4 px-6">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5ECE5] text-sm">

                {loading ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Memuat barang...
                    </td>
                  </tr>

                ) : products.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Tidak ada barang ditemukan.
                    </td>
                  </tr>

                ) : (

                  products.map((p) => (

                    <tr
                      key={p.id}
                      className="hover:bg-[#FAF0ED]/50 transition-colors"
                    >

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

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </main>

      </div>
    </div>
  );
}