import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let sql = `
      SELECT 
        t.id,
        t.user_id,
        t.member_id,
        t.nama_petugas,
        t.total,
        t.bayar,
        t.kembalian,
        t.tanggal,

        COALESCE(
          t.nama_petugas,
          u.nama,
          'Petugas Kasir'
        ) AS petugas_name,

        COALESCE(
          m.nama,
          'Umum / Non-Member'
        ) AS member_name

      FROM transactions t

      LEFT JOIN users u
        ON t.user_id = u.id

      LEFT JOIN members m
        ON t.member_id = m.id

      WHERE 1=1
    `;

    const params: any[] = [];

    // =========================
    // SEARCH
    // =========================
    if (search) {
      sql += `
        AND (
          t.id LIKE ?
          OR t.nama_petugas LIKE ?
          OR u.nama LIKE ?
          OR m.nama LIKE ?
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    // =========================
    // FILTER TANGGAL
    // =========================
    if (startDate) {
      sql += " AND DATE(t.tanggal) >= ?";
      params.push(startDate);
    }

    if (endDate) {
      sql += " AND DATE(t.tanggal) <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY t.id DESC";

    const rows = await query<any[]>(sql, params);

    const formatted = rows.map((r) => ({
      id: r.id,

      invoice_number: `TRX-${String(r.id).padStart(5, "0")}`,

      user_id: r.user_id,
      member_id: r.member_id,

      // Nama petugas yang tersimpan saat transaksi dibuat
      petugas_name: r.petugas_name,

      member_name: r.member_name,

      total: Number(r.total),
      bayar: Number(r.bayar),
      kembalian: Number(r.kembalian),

      tanggal: r.tanggal,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Transactions GET error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal mengambil riwayat transaksi: " + error.message,
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// POST - BUAT TRANSAKSI BARU
// ======================================================

export async function POST(request: Request) {
  try {
    const session = await getSession();

    const body = await request.json();

    const {
      member_id,
      total,
      bayar,
      kembalian,
      items,
    } = body;

    // ==================================================
    // USER / PETUGAS
    // ==================================================

    const userId = session?.id || body.user_id || 1;

    /*
      PENTING:

      nama_bertugas berasal dari session ketika login.

      Contoh:
      Akun = petugas
      Nama Petugas yang Bertugas = Yerico

      Maka transaksi akan menyimpan:
      nama_petugas = Yerico

      Bukan mengambil nama akun dari tabel users.
    */

    const petugasName =
      session?.nama_bertugas ||
      session?.nama ||
      "Petugas Kasir";

    // ==================================================
    // VALIDASI KERANJANG
    // ==================================================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Keranjang belanja kosong.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // VALIDASI PEMBAYARAN
    // ==================================================

    const payNum = Number(bayar);
    const totalNum = Number(total);

    if (isNaN(payNum) || payNum < totalNum) {
      return NextResponse.json(
        {
          error: `Uang pembayaran (Rp ${payNum.toLocaleString(
            "id-ID"
          )}) kurang dari total transaksi (Rp ${totalNum.toLocaleString(
            "id-ID"
          )}).`,
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // CEK STOK SEMUA PRODUK
    // ==================================================

    for (const item of items) {
      const productRows = await query<any[]>(
        `
          SELECT
            id,
            nama_barang,
            stok
          FROM products
          WHERE id = ?
        `,
        [item.product_id]
      );

      if (
        !productRows ||
        productRows.length === 0
      ) {
        return NextResponse.json(
          {
            error: `Produk ID ${item.product_id} tidak ditemukan.`,
          },
          {
            status: 404,
          }
        );
      }

      const prod = productRows[0];

      if (
        Number(prod.stok) <
        Number(item.jumlah)
      ) {
        return NextResponse.json(
          {
            error: `Stok produk "${prod.nama_barang}" tidak mencukupi (Tersedia: ${prod.stok}, Diminta: ${item.jumlah}).`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // ==================================================
    // WAKTU TRANSAKSI
    // ==================================================

    const now = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const memberIdValue = member_id
      ? Number(member_id)
      : null;

    // ==================================================
    // INSERT TRANSAKSI
    // ==================================================

    /*
      Sekarang nama_petugas ikut disimpan.

      Jadi kalau:

      Shift 1 = Arifki
      Shift 2 = Yerico

      transaksi Shift 1 tetap Arifki,
      walaupun sekarang login sebagai Yerico.
    */

    const trxResult = await query<any>(
      `
        INSERT INTO transactions
        (
          user_id,
          nama_petugas,
          member_id,
          total,
          bayar,
          kembalian,
          tanggal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        petugasName,
        memberIdValue,
        totalNum,
        payNum,
        Number(kembalian),
        now,
      ]
    );

    const transactionId =
      trxResult.insertId;

    // ==================================================
    // DETAIL TRANSAKSI + UPDATE STOK
    // ==================================================

    for (const item of items) {
      const pId = Number(item.product_id);
      const qty = Number(item.jumlah);
      const price = Number(item.harga);

      const subtotal = Number(
        item.subtotal ||
          qty * price
      );

      // -----------------------------
      // INSERT DETAIL
      // -----------------------------

      await query(
        `
          INSERT INTO transaction_details
          (
            transaction_id,
            product_id,
            jumlah,
            harga,
            subtotal
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          transactionId,
          pId,
          qty,
          price,
          subtotal,
        ]
      );

      // -----------------------------
      // AMBIL STOK TERBARU
      // -----------------------------

      const pRows = await query<any[]>(
        `
          SELECT
            nama_barang,
            stok
          FROM products
          WHERE id = ?
        `,
        [pId]
      );

      if (
        !pRows ||
        pRows.length === 0
      ) {
        continue;
      }

      const currentStock =
        Number(pRows[0].stok);

      const newStock =
        currentStock - qty;

      // -----------------------------
      // UPDATE STOK
      // -----------------------------

      await query(
        `
          UPDATE products
          SET stok = ?
          WHERE id = ?
        `,
        [
          newStock,
          pId,
        ]
      );

      // -----------------------------
      // STOCK LOG
      // -----------------------------

      await query(
        `
          INSERT INTO stock_logs
          (
            product_id,
            nama_barang,
            tipe,
            jumlah,
            stok_sebelum,
            stok_sesudah,
            catatan
          )
          VALUES (?, ?, 'keluar', ?, ?, ?, ?)
        `,
        [
          pId,
          pRows[0].nama_barang,
          qty,
          currentStock,
          newStock,
          `Transaksi #${transactionId}`,
        ]
      );
    }

    // ==================================================
    // MEMBER
    // ==================================================

    let memberName =
      "Umum / Non-Member";

    if (memberIdValue) {
      const mRows = await query<any[]>(
        `
          SELECT nama
          FROM members
          WHERE id = ?
        `,
        [memberIdValue]
      );

      if (
        mRows &&
        mRows.length > 0
      ) {
        memberName =
          mRows[0].nama;
      }
    }

    // ==================================================
    // INVOICE
    // ==================================================

    const invoiceNumber =
      `TRX-${String(transactionId).padStart(
        5,
        "0"
      )}`;

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      message:
        "Transaksi berhasil diproses!",

      transaction: {
        id: transactionId,

        invoice_number:
          invoiceNumber,

        petugas_name:
          petugasName,

        member_name:
          memberName,

        total:
          totalNum,

        bayar:
          payNum,

        kembalian:
          Number(kembalian),

        tanggal:
          now,

        items:
          items,
      },
    });
  } catch (error: any) {
    console.error(
      "Transaction POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal memproses transaksi: " +
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}