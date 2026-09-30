"use client";

import React, { useState } from "react";
import { Printer, Download, X, CheckCircle2, Sparkles } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { FlowerIcon } from "./FloralDecor";

interface TransactionItem {
  id?: number;
  product_id: number;
  nama_barang: string;
  jumlah: number;
  harga: number;
  subtotal: number;
}

interface TransactionReceipt {
  id: number;
  invoice_number: string;
  petugas_name: string;
  member_name: string;
  total: number;
  bayar: number;
  kembalian: number;
  tanggal: string;
  items: TransactionItem[];
}

interface ReceiptModalProps {
  transaction: TransactionReceipt | null;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById("receipt-content");
      if (!element) return;

      const width = element.offsetWidth || 450;
      const height = element.offsetHeight || 650;

      const canvas = document.createElement("canvas");
      const scale = 2; // High DPI resolution
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = "#FAF5EF";
        ctx.fillRect(0, 0, width, height);

        // Convert DOM content to inline SVG foreignObject
        const htmlContent = element.outerHTML;
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;family=Plus+Jakarta+Sans:wght@500;700&amp;display=swap');
              * { box-sizing: border-box; margin: 0; padding: 0; }
            </style>
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${htmlContent}
              </div>
            </foreignObject>
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `Struk_${transaction.invoice_number || "KasirKu"}.png`;
          link.href = pngUrl;
          link.click();
          setDownloading(false);
        };

        img.onerror = () => {
          // Fallback simple download
          URL.revokeObjectURL(url);
          setDownloading(false);
        };

        img.src = url;
      }
    } catch (err) {
      console.error("PNG Download error", err);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#272023]/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#EADFD5] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Close & Action Buttons Toolbar */}
        <div className="flex items-center justify-between border-b border-[#F5ECE5] pb-5 mb-6 no-print">
          <div className="flex items-center gap-2.5 text-[#1F6B58] font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Struk Belanja KasirKu</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D707E] text-white text-xs font-bold hover:bg-[#2F5864] transition-colors shadow-xs disabled:opacity-50"
              title="Download Struk sebagai gambar PNG"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Mengunduh..." : "Download PNG"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E4663] text-[#FAF5EF] text-xs font-bold hover:bg-[#3B344D] transition-colors shadow-xs"
              title="Cetak Struk ke Printer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8C7E84] hover:bg-[#FAF0ED] hover:text-[#9B3B3B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ENLARGED PRINTABLE RECEIPT CONTAINER */}
        <div
          id="receipt-content"
          className="p-6 bg-[#FAF5EF] rounded-3xl border border-[#EADFD5] text-[#272023] font-mono text-sm leading-relaxed shadow-sm"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-[#CBA59C] mb-4">
            <div className="flex justify-center mb-1.5">
              <FlowerIcon className="w-8 h-8 text-[#9B3B3B]" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-[#272023] tracking-tight">
              Kasir<span className="text-[#9B3B3B] italic">Ku</span>
            </h2>
            <p className="text-xs font-sans font-semibold text-[#7D7075] mt-0.5">Bloom POS System — Nota Resmi</p>
            <p className="text-[11px] text-[#8C7E84] mt-0.5">SMK PPLG Kasir Application</p>
          </div>

          {/* Meta Info Breakdown */}
          <div className="space-y-1.5 mb-4 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-[#7D7075]">No. Invoice:</span>
              <span className="font-mono font-bold text-[#9B3B3B]">{transaction.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D7075]">Tanggal & Waktu:</span>
              <span className="font-medium text-[#272023]">{formatDate(transaction.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D7075]">Petugas Kasir:</span>
              <span className="font-bold text-[#272023]">{transaction.petugas_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D7075]">Member / Pelanggan:</span>
              <span className="font-bold text-[#3D707E]">{transaction.member_name}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-[#CBA59C] py-3 my-3 space-y-2.5">
            {transaction.items && transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-sans font-bold text-sm text-[#272023]">
                  {item.nama_barang}
                </div>
                <div className="flex justify-between text-[#695E63] text-xs font-mono">
                  <span>{item.jumlah} unit x {formatRupiah(item.harga)}</span>
                  <span className="font-bold text-[#272023]">{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-1.5 text-xs font-sans pt-1">
            <div className="flex justify-between font-bold text-base text-[#272023] pt-1">
              <span>TOTAL BELANJA:</span>
              <span className="text-[#9B3B3B] font-serif text-lg">{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-[#695E63]">
              <span>Uang Tunai / Bayar:</span>
              <span className="font-mono font-semibold text-[#272023]">{formatRupiah(transaction.bayar)}</span>
            </div>
            <div className="flex justify-between text-[#1F6B58] font-bold text-sm">
              <span>Kembalian:</span>
              <span className="font-mono text-base">{formatRupiah(transaction.kembalian)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-5 pt-4 border-t border-dashed border-[#CBA59C] text-center text-xs text-[#7D7075] space-y-0.5">
            <p className="font-serif italic font-semibold text-[#9B3B3B]">~ Terima kasih atas kunjungan Anda ~</p>
            <p className="font-sans text-[11px]">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
          </div>
        </div>

        {/* Modal Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3.5 rounded-xl bg-[#9B3B3B] text-white font-bold text-sm hover:bg-[#833131] transition-colors shadow-md no-print"
        >
          Selesai & Tutup Struk
        </button>

      </div>
    </div>
  );
}
