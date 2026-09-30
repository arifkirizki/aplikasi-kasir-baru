import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Ambil session user yang sedang login
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sesi login tidak ditemukan." },
        { status: 401 }
      );
    }

    const { product_id, tipe, jumlah, catatan } = await request.json();

    if (!product_id || !tipe || !jumlah || isNaN(Number(jumlah))) {
      return NextResponse.json(
        {
          error:
            "Pilih barang, tipe perubahan (masuk/keluar), dan jumlah valid.",
        },
        { status: 400 }
      );
    }

    const qty = Math.abs(Number(jumlah));

    if (qty <= 0) {
      return NextResponse.json(
        {
          error: "Jumlah perubahan stok harus lebih besar dari 0.",
        },
        { status: 400 }
      );
    }

    // Ambil data barang
    const products = await query<any[]>(
      "SELECT * FROM products WHERE id = ?",
      [product_id]
    );

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan." },
        { status: 404 }
      );
    }

    const product = products[0];

    const stockBefore = Number(product.stok);
    let stockAfter = stockBefore;

    // Tentukan perubahan stok
    if (tipe === "masuk") {
      stockAfter = stockBefore + qty;
    } else if (tipe === "keluar") {
      if (stockBefore < qty) {
        return NextResponse.json(
          {
            error: `Stok tidak mencukupi. Stok saat ini: ${stockBefore}, diminta: ${qty}`,
          },
          { status: 400 }
        );
      }

      stockAfter = stockBefore - qty;
    } else {
      return NextResponse.json(
        {
          error: "Tipe perubahan tidak valid.",
        },
        { status: 400 }
      );
    }

    // Update stok barang
    await query(
      "UPDATE products SET stok = ? WHERE id = ?",
      [stockAfter, product_id]
    );

    // Simpan riwayat perubahan stok
    await query(
      `INSERT INTO stock_logs
      (
        product_id,
        user_id,
        nama_barang,
        tipe,
        jumlah,
        stok_sebelum,
        stok_sesudah,
        catatan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        session.id,
        product.nama_barang,
        tipe,
        qty,
        stockBefore,
        stockAfter,
        catatan ||
          (tipe === "masuk"
            ? "Penambahan stok"
            : "Pengurangan stok"),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Stok ${product.nama_barang} berhasil diperbarui dari ${stockBefore} menjadi ${stockAfter}.`,
      stok_sebelum: stockBefore,
      stok_sesudah: stockAfter,
      user_id: session.id,
      nama_user: session.nama,
    });
  } catch (error: any) {
    console.error("Stock update API error:", error);

    return NextResponse.json(
      {
        error: "Gagal memperbarui stok: " + error.message,
      },
      { status: 500 }
    );
  }
}