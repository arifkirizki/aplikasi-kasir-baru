"use client";

import React from "react";
import { FlowerIcon } from "./FloralDecor";
import { Calendar, User as UserIcon } from "lucide-react";
import { formatShortDate } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userNama?: string;
  userRole?: string;
}

export default function Header({
  title,
  subtitle,
  userNama,
  userRole = "admin",
}: HeaderProps) {
  const todayStr = formatShortDate(new Date());

  const displayName =
    userNama && userNama.trim() !== ""
      ? userNama
      : userRole === "petugas"
      ? "Petugas Kasir"
      : "Admin";

  return (
    <header className="bg-[#FAF5EF] border-b border-[#EADFD5] px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">

      {/* LEFT */}
      <div>

        <div className="flex items-center gap-2">
          <FlowerIcon className="w-5 h-5 text-[#9B3B3B]" />

          <span className="text-xs font-bold uppercase tracking-wider text-[#9B3B3B]">
            System Kasir Editorial
          </span>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#272023] mt-1 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-[#695E63] mt-0.5 max-w-xl font-normal">
            {subtitle}
          </p>
        )}

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 self-start md:self-auto">

        {/* DATE */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EADFD5] text-xs text-[#695E63] shadow-xs">

          <Calendar className="w-3.5 h-3.5 text-[#9B3B3B]" />

          <span>{todayStr}</span>

        </div>

        {/* USER */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FAF0ED] border border-[#F0D5CE] text-xs font-semibold text-[#9B3B3B] shadow-xs">

          <UserIcon className="w-3.5 h-3.5 text-[#9B3B3B]" />

          <span>
            Halo, {displayName}
          </span>

          <span className="px-2 py-0.5 rounded-full bg-white text-[10px] uppercase font-bold text-[#4E4663] border border-[#E0D0DC]">
            {userRole}
          </span>

        </div>

      </div>

    </header>
  );
}