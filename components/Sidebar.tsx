"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  UserPlus,
  ShoppingCart,
  Users,
  Receipt,
  FileText,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { FlowerIcon } from "./FloralDecor";

interface SidebarProps {
  userRole: "admin" | "petugas";
  userName?: string;
  userUsername?: string;
}

export default function Sidebar({
  userRole,
  userName = "User",
  userUsername = "user",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Hapus data client lama kalau ada
      localStorage.removeItem("user");

      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const adminNav = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Data Barang",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Update Stok",
      href: "/admin/update-stok",
      icon: Boxes,
    },
    {
      label: "Registrasi Petugas",
      href: "/admin/register-petugas",
      icon: UserPlus,
    },
    {
      label: "Profil",
      href: "/admin/profile",
      icon: User,
    },
  ];

  const petugasNav = [
    {
      label: "Dashboard",
      href: "/petugas/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Data Barang",
      href: "/petugas/products",
      icon: Package,
    },
    {
      label: "Transaksi / Kasir",
      href: "/petugas/kasir",
      icon: ShoppingCart,
    },
    {
      label: "Data Member",
      href: "/petugas/members",
      icon: Users,
    },
    {
      label: "Riwayat Transaksi",
      href: "/petugas/transactions",
      icon: Receipt,
    },
    {
      label: "Laporan",
      href: "/petugas/reports",
      icon: FileText,
    },
    {
      label: "Profil",
      href: "/petugas/profile",
      icon: User,
    },
  ];

  const navItems =
    userRole === "admin" ? adminNav : petugasNav;

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#EADFD5] flex flex-col h-screen sticky top-0 z-30 select-none shadow-[2px_0_15px_rgba(78,70,99,0.03)]">

      {/* Brand Header */}
      <div className="p-6 border-b border-[#F5ECE5] flex flex-col gap-2 bg-[#FAF5EF]/50">

        <div className="flex items-center gap-2.5">

          <div className="w-10 h-10 rounded-full bg-[#F3CECE] flex items-center justify-center text-[#9B3B3B] shadow-sm">
            <FlowerIcon className="w-6 h-6 text-[#9B3B3B]" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-[#272023] tracking-tight">
              Kasir
              <span className="text-[#9B3B3B] italic">
                Ku
              </span>
            </h1>

            <p className="text-[11px] uppercase tracking-widest text-[#7D7075] font-semibold">
              Bloom POS System
            </p>
          </div>

        </div>

        {/* Role Pill */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0ED] border border-[#F0D5CE] w-fit">

          <Sparkles className="w-3 h-3 text-[#9B3B3B]" />

          <span className="text-xs font-semibold uppercase tracking-wider text-[#9B3B3B]">
            Role: {userRole}
          </span>

        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">

        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9E9096]">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-[#4E4663] text-[#FAF5EF] shadow-md font-semibold translate-x-1"
                  : "text-[#695E63] hover:bg-[#FAF0ED] hover:text-[#9B3B3B]"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? "text-[#F3CECE]"
                    : "text-[#8C7E84]"
                }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}

      </nav>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-[#F5ECE5] bg-[#FAF5EF]/60">

        <div className="p-3 rounded-xl bg-white border border-[#EADFD5] flex items-center justify-between shadow-xs">

          <div className="flex items-center gap-2.5 overflow-hidden">

            <div className="w-9 h-9 rounded-full bg-[#E5F0F2] text-[#3D707E] font-serif font-bold flex items-center justify-center text-base border border-[#CDE1E5] shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="truncate">

              <p className="text-xs font-bold text-[#272023] truncate">
                {userName}
              </p>

              <p className="text-[11px] text-[#8C7E84] truncate">
                @{userUsername}
              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 rounded-lg text-[#8C7E84] hover:text-[#9B3B3B] hover:bg-[#FDEAE4] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>

    </aside>
  );
}