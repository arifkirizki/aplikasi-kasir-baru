"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatShortDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";

interface Member {
  id: number;
  nama: string;
  telepon: string;
  alamat: string;
  created_at: string;
}

export default function MembersPage() {
  const [user, setUser] = useState<any>({
    nama: "Petugas Kasir",
    username: "petugas",
    role: "petugas",
    nama_bertugas: "Petugas Kasir",
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const [formNama, setFormNama] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Ambil sesi login terbaru
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

  const displayName =
    user.nama_bertugas || user.nama || "Petugas Kasir";

  // Ambil data member
  const fetchMembers = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/members?search=${encodeURIComponent(search)}`
      );

      const data = await res.json();

      if (res.ok) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data member:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleOpenAdd = () => {
    setFormNama("");
    setFormTelepon("");
    setFormAlamat("");
    setFormError("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditMember(member);
    setFormNama(member.nama);
    setFormTelepon(member.telepon || "");
    setFormAlamat(member.alamat || "");
    setFormError("");
  };

  // Tambah member
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim() || !formTelepon.trim()) {
      setFormError("Nama dan nomor telepon wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formNama.trim(),
          telepon: formTelepon.trim(),
          alamat: formAlamat.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menambah member.");
      }

      setIsAddOpen(false);
      await fetchMembers();
    } catch (error: any) {
      setFormError(error.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit member
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editMember) return;

    setFormError("");

    if (!formNama.trim() || !formTelepon.trim()) {
      setFormError("Nama dan nomor telepon wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/members/${editMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formNama.trim(),
          telepon: formTelepon.trim(),
          alamat: formAlamat.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui member.");
      }

      setEditMember(null);
      await fetchMembers();
    } catch (error: any) {
      setFormError(error.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus member
  const handleDelete = async () => {
    if (!deleteMember) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/members/${deleteMember.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus member.");
      }

      setDeleteMember(null);
      await fetchMembers();
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF5EF]">
      <Sidebar
        userRole="petugas"
        userName={displayName}
        userUsername={user.username}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Data Member / Pelanggan"
          subtitle="Kelola keanggotaan pelanggan, nomor telepon, dan alamat."
          userNama={displayName}
          userRole={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* PENCARIAN DAN TOMBOL TAMBAH */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E84]" />

              <input
                type="text"
                placeholder="Cari nama, telepon, atau alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#9B3B3B]"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D707E] text-white font-bold text-xs hover:bg-[#2F5864] transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Member Baru</span>
            </button>
          </div>

          {/* TABEL MEMBER */}
          <div className="bg-white border border-[#EADFD5] rounded-3xl overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EF] border-b border-[#EADFD5] text-[11px] font-bold uppercase tracking-wider text-[#7D7075]">
                  <th className="py-4 px-6">ID Member</th>
                  <th className="py-4 px-6">Nama Member</th>
                  <th className="py-4 px-6">Telepon</th>
                  <th className="py-4 px-6">Alamat</th>
                  <th className="py-4 px-6">Terdaftar</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5ECE5] text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Memuat data member...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-xs text-[#8C7E84]"
                    >
                      Belum ada member terdaftar.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-[#FAF0ED]/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#3D707E]">
                        MB-{String(member.id).padStart(3, "0")}
                      </td>

                      <td className="py-4 px-6 font-bold text-[#272023]">
                        {member.nama}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#695E63]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#3D707E]" />
                          <span>{member.telepon || "-"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-[#695E63] max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#9B3B3B] shrink-0" />
                          <span className="truncate">
                            {member.alamat || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-[#8C7E84]">
                        {formatShortDate(member.created_at)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            title="Edit Member"
                            className="p-2 rounded-xl bg-[#FAF5EF] text-[#4E4663] hover:bg-[#4E4663] hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteMember(member)}
                            title="Hapus Member"
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
        </main>
      </div>

      {/* MODAL TAMBAH MEMBER */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5ECE5] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#272023]">
                Tambah Member Baru
              </h3>

              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-[#8C7E84] hover:bg-[#FAF0ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FBE6E8] text-[#9E2A38] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  No. Telepon / WA
                </label>
                <input
                  type="text"
                  required
                  value={formTelepon}
                  onChange={(e) => setFormTelepon(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={3}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Jl. Merdeka No. 12..."
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EADFD5] font-bold text-[#695E63]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#3D707E] text-white font-bold hover:bg-[#2F5864] shadow-md disabled:opacity-50"
                >
                  {submitting ? "Simpan..." : "Simpan Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MEMBER */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5ECE5] mb-4">
              <h3 className="font-serif text-xl font-bold text-[#272023]">
                Edit Member #MB-{String(editMember.id).padStart(3, "0")}
              </h3>

              <button
                onClick={() => setEditMember(null)}
                className="p-1 rounded-xl text-[#8C7E84] hover:bg-[#FAF0ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FBE6E8] text-[#9E2A38] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  No. Telepon / WA
                </label>
                <input
                  type="text"
                  required
                  value={formTelepon}
                  onChange={(e) => setFormTelepon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#272023] mb-1 uppercase tracking-wider">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={3}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#EADFD5] rounded-xl text-sm text-[#272023] focus:outline-none focus:border-[#3D707E]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EADFD5] font-bold text-[#695E63]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4E4663] text-white font-bold hover:bg-[#3B344D] shadow-md disabled:opacity-50"
                >
                  {submitting ? "Update..." : "Update Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS MEMBER */}
      {deleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FBE6E8] text-[#9E2A38] flex items-center justify-center mx-auto mb-4 border border-[#F4B2B6]">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg font-bold text-[#272023]">
              Hapus Member Ini?
            </h3>

            <p className="text-xs text-[#695E63] mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus member{" "}
              <span className="font-bold text-[#272023]">
                "{deleteMember.nama}"
              </span>
              ?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteMember(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EADFD5] text-xs font-bold text-[#695E63]"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#9E2A38] text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {submitting ? "Hapus..." : "Ya, Hapus Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}