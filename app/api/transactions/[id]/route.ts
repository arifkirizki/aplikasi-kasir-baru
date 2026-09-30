import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID transaksi tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // AMBIL DATA TRANSAKSI
    // ==================================================

    const trxRows = await query<any[]>(
      `
        SELECT

          t.id,
          t.user_id,
          t.member_id,

          /*
            Gunakan nama_petugas yang disimpan
            ketika transaksi dibuat.

            Fallback ke users.nama hanya untuk
            transaksi lama yang mungkin masih NULL.
          */

          COALESCE(
            t.nama_petugas,
            u.nama,
            'Petugas Kasir'
          ) AS petugas_name,

          COALESCE(
            m.nama,
            'Umum / Non-Member'
          ) AS member_name,

          t.total,
          t.bayar,
          t.kembalian,
          t.tanggal

        FROM transactions t

        LEFT JOIN users u
          ON t.user_id = u.id

        LEFT JOIN members m
          ON t.member_id = m.id

        WHERE t.id = ?
      `,
      [id]
    );

    // ==================================================
    // TRANSAKSI TIDAK DITEMUKAN
    // ==================================================

    if (
      !trxRows ||
      trxRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Transaksi tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const trx =
      trxRows[0];

    // ==================================================
    // DETAIL TRANSAKSI
    // ==================================================

    const detailRows =
      await query<any[]>(
        `
          SELECT

            td.id,
            td.product_id,

            p.nama_barang,

            td.jumlah,
            td.harga,
            td.subtotal

          FROM transaction_details td

          LEFT JOIN products p
            ON td.product_id = p.id

          WHERE td.transaction_id = ?

          ORDER BY td.id ASC
        `,
        [id]
      );

    // ==================================================
    // FORMAT ITEM
    // ==================================================

    const items =
      detailRows.map((d) => ({
        id: d.id,

        product_id:
          d.product_id,

        nama_barang:
          d.nama_barang ||
          `Produk #${d.product_id}`,

        jumlah:
          Number(d.jumlah),

        harga:
          Number(d.harga),

        subtotal:
          Number(d.subtotal),
      }));

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      data: {
        id: trx.id,

        invoice_number:
          `TRX-${String(trx.id).padStart(
            5,
            "0"
          )}`,

        /*
          Ini sekarang mengambil nama petugas
          dari transaksi tersebut.

          Jadi transaksi lama tidak akan berubah
          ketika petugas yang login berganti.
        */

        petugas_name:
          trx.petugas_name,

        member_name:
          trx.member_name,

        total:
          Number(trx.total),

        bayar:
          Number(trx.bayar),

        kembalian:
          Number(trx.kembalian),

        tanggal:
          trx.tanggal,

        items:
          items,
      },
    });
  } catch (error: any) {
    console.error(
      "Transaction details API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil detail transaksi: " +
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}