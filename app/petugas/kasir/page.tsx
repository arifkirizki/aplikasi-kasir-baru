"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReceiptModal from "@/components/ReceiptModal";
import { formatRupiah } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, ShoppingCart, UserPlus, CreditCard, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface Product {
  id: number;
  nama_barang: string;
  harga: number;
  stok: number;
  kategori: string;
  status: string;
}

interface Member {
  id: number;
  nama: string;
  telepon: string;
  alamat: string;
}

interface CartItem {
  product: Product;
  jumlah: number;
  subtotal: number;
}

export default function KasirPage() {
  const [user, setUser] = useState<any>({ nama: "Petugas Kasir", username: "petugas", role: "petugas" });
  
  // Products & Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Members
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // Cart & Payment
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payAmount, setPayAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [posError, setPosError] = useState("");

  // Completed transaction for receipt modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Quick Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemNama, setNewMemNama] = useState("");
  const [newMemTelepon, setNewMemTelepon] = useState("");
  const [newMemAlamat, setNewMemAlamat] = useState("");

  const categories = ["Semua", "Makanan", "Minuman", "Dessert", "Lainnya"];

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      let url = "/api/products?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory && selectedCategory !== "Semua") url += `category=${encodeURIComponent(selectedCategory)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (res.ok) setMembers(data.data || []);
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

    fetchMembers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    setPosError("");
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].jumlah;
      if (currentQty + 1 > product.stok) {
        setPosError(`Stok "${product.nama_barang}" hanya tersisa ${product.stok} unit.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].jumlah += 1;
      updated[existingIndex].subtotal = updated[existingIndex].jumlah * product.harga;
      setCart(updated);
    } else {
      if (product.stok < 1) {
        setPosError(`Stok "${product.nama_barang}" habis.`);
        return;
      }
      setCart([...cart, { product, jumlah: 1, subtotal: product.harga }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setPosError("");
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        const newQty = item.jumlah + delta;
        if (newQty > item.product.stok) {
          setPosError(`Stok "${item.product.nama_barang}" hanya tersisa ${item.product.stok} unit.`);
          return item;
        }
        if (newQty > 0) {
          return {
            ...item,
            jumlah: newQty,
            subtotal: newQty * item.product.harga,
          };
        }
        return null;
      }
      return item;
    }).filter(Boolean) as CartItem[];

    setCart(updated);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Computations
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const payNumber = Number(payAmount) || 0;
  const changeAmount = payNumber >= totalAmount ? payNumber - totalAmount : 0;

  // Checkout submission
  const handleCheckout = async () => {
    setPosError("");

    if (cart.length === 0) {
      setPosError("Keranjang belanja masih kosong.");
      return;
    }

    if (payNumber < totalAmount) {
      setPosError(`Uang pembayaran kurang ${formatRupiah(totalAmount - payNumber)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        jumlah: item.jumlah,
        harga: item.product.harga,
        subtotal: item.subtotal,
      }));

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMemberId ? Number(selectedMemberId) : null,
          total: totalAmount,
          bayar: payNumber,
          kembalian: changeAmount,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses transaksi");

      // Set receipt modal & reset cart
      setReceiptData(data.transaction);
      setCart([]);
      setPayAmount("");
      setSelectedMemberId("");

      // Refresh product stocks
      fetchProducts();
    } catch (err: any) {
      setPosError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Add Member Handler
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemNama.trim() || !newMemTelepon.trim()) return;

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: newMemNama,
          telepon: newMemTelepon,
          alamat: newMemAlamat,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAddMemberOpen(false);
        setNewMemNama("");
        setNewMemTelepon("");
        setNewMemAlamat("");
        await fetchMembers();
        setSelectedMemberId(String(data.memberId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar userRole="petugas" userName={user.nama} userUsername={user.username} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Terminal Kasir / Point of Sale"
          subtitle="Pilih produk, sesuaikan jumlah, pilih member, dan proses transaksi pembayaran."
          userNama={user.nama}
          userRole={user.role}
        />

        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CENTER COLUMN: PRODUCTS SELECTION GRID (7 or 8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Search & Category Filter Toolbar */}
              <div className="bg-white border border-[#EADFD5] rounded-3xl p-4 md:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />
                  <input
                    type="text"
                    placeholder="Cari barang atau kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#FAF5EF] rounded-2xl border border-[#EADFD5] overflow-x-auto w-full sm:w-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                        selectedCategory === cat
                          ? "bg-[#9B3B3B] text-white shadow-xs"
                          : "text-[#695E63] hover:text-[#272023]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              {loadingProducts ? (
                <div className="py-16 text-center text-xs text-[#8C7E84]">Memuat produk...</div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8C7E84]">Tidak ada produk ditemukan.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p) => {
                    const isOutOfStock = p.stok <= 0;

                    return (
                      <div
                        key={p.id}
                        className={`editorial-card p-5 rounded-3xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                          isOutOfStock ? "opacity-60 bg-[#FAF5EF]" : "hover:border-[#9B3B3B]/40 hover:shadow-md"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0ED] border border-[#F0D5CE] text-[10px] font-bold uppercase text-[#9B3B3B]">
                              {p.kategori}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? "bg-[#FBE6E8] text-[#9E2A38]"
                                : p.stok <= 15
                                ? "bg-[#FDEAE4] text-[#A8442A]"
                                : "bg-[#E3F2ED] text-[#1F6B58]"
                            }`}>
                              Stok: {p.stok}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-[#272023] leading-snug line-clamp-2">
                            {p.nama_barang}
                          </h3>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F5ECE5] flex items-center justify-between">
                          <span className="font-serif text-lg font-bold text-[#9B3B3B]">
                            {formatRupiah(p.harga)}
                          </span>

                          <button
                            onClick={() => addToCart(p)}
                            disabled={isOutOfStock}
                            className="px-3.5 py-2 rounded-xl bg-[#4E4663] text-white font-bold text-xs hover:bg-[#9B3B3B] transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: TRANSACTION CART DRAWER (5 or 4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-lg flex flex-col justify-between sticky top-6 min-h-[620px]">
              
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#F5ECE5] mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#9B3B3B]" />
                    <h2 className="font-serif text-xl font-bold text-[#272023]">Keranjang Belanja</h2>
                  </div>
                  <span className="text-xs font-bold text-[#695E63] bg-[#FAF5EF] px-2.5 py-1 rounded-full border border-[#EADFD5]">
                    {cart.reduce((sum, i) => sum + i.jumlah, 0)} Barang
                  </span>
                </div>

                {posError && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#FBE6E8] border border-[#F4B2B6] text-[#9E2A38] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{posError}</span>
                  </div>
                )}

                {/* MEMBER SELECTOR & QUICK ADD */}
<div className="mb-5">
  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7D7075] mb-2">
    Pelanggan / Member
  </label>

  <div className="flex gap-2">
    {/* Member Dropdown */}
    <select
      value={selectedMemberId}
      onChange={(e) => setSelectedMemberId(e.target.value)}
      className="flex-1 min-w-0 px-3.5 py-3 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-xs font-semibold text-[#272023] focus:outline-none focus:border-[#9B3B3B] transition-colors"
    >
      <option value="">Umum / Non-Member</option>

      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nama} ({m.telepon})
        </option>
      ))}
    </select>

    {/* Tambah Member Button */}
    <button
      type="button"
      onClick={() => setIsAddMemberOpen(true)}
      className="shrink-0 px-4 py-3 rounded-xl bg-[#9B3B3B] text-white font-bold text-xs hover:bg-[#833131] transition-all shadow-sm flex items-center justify-center gap-2"
      title="Tambah Member Baru"
    >
      <UserPlus className="w-4 h-4" />
      <span>Tambah Member</span>
    </button>
  </div>
</div>

                {/* CART ITEMS LIST */}
                <div className="max-h-60 overflow-y-auto divide-y divide-[#F5ECE5] pr-1 mb-4">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#8C7E84] space-y-2">
                      <p>Keranjang belanja kosong.</p>
                      <p className="text-[11px] text-[#9E9096]">Klik tombol "+ Tambah" pada produk di sebelah kiri.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#272023] truncate">{item.product.nama_barang}</p>
                          <p className="text-[11px] text-[#9B3B3B] font-semibold">{formatRupiah(item.product.harga)}</p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1 bg-[#FAF5EF] p-1 rounded-xl border border-[#EADFD5]">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-[#272023] hover:bg-[#FAF0ED] flex items-center justify-center font-bold text-xs shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#272023]">{item.jumlah}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white text-[#272023] hover:bg-[#FAF0ED] flex items-center justify-center font-bold text-xs shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-[#272023] block">{formatRupiah(item.subtotal)}</span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[#9E9096] hover:text-[#9B3B3B] transition-colors mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENT BREAKDOWN & CHECKOUT FORM */}
              <div className="pt-4 border-t border-[#F5ECE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#695E63]">Total Belanja:</span>
                  <span className="font-serif text-2xl font-bold text-[#9B3B3B]">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>

                {/* Input Pay Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-[#272023] uppercase tracking-wider mb-1">
                    Uang Pembayaran (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm font-bold text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
                  />
                </div>

                {/* Auto Kembalian */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#E3F2ED] border border-[#A7DEC9] text-xs font-bold text-[#1F6B58]">
                  <span>Kembalian:</span>
                  <span className="font-mono text-sm">{formatRupiah(changeAmount)}</span>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleCheckout}
                  disabled={submitting || cart.length === 0 || payNumber < totalAmount}
                  className="w-full py-3.5 rounded-xl bg-[#9B3B3B] text-white font-bold text-sm hover:bg-[#833131] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submitting ? "Memproses Transaksi..." : "Bayar & Cetak Struk"}</span>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* QUICK ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-serif text-xl font-bold text-[#272023] mb-4">Tambah Member Cepat</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#272023] mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  required
                  value={newMemNama}
                  onChange={(e) => setNewMemNama(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3.5 py-2 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#272023] mb-1">No. Telepon / WA</label>
                <input
                  type="text"
                  required
                  value={newMemTelepon}
                  onChange={(e) => setNewMemTelepon(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3.5 py-2 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#272023] mb-1">Alamat</label>
                <input
                  type="text"
                  value={newMemAlamat}
                  onChange={(e) => setNewMemAlamat(e.target.value)}
                  placeholder="Alamat singkat"
                  className="w-full px-3.5 py-2 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023]"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#695E63]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#9B3B3B] text-white font-bold text-xs shadow-xs"
                >
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL UPON SUCCESSFUL PAYMENT */}
      <ReceiptModal
        transaction={receiptData}
        onClose={() => setReceiptData(null)}
      />

    </div>
  );
}
