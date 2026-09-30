import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let dateFilterSql = "";
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilterSql = " WHERE DATE(tanggal) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilterSql = " WHERE DATE(tanggal) >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateFilterSql = " WHERE DATE(tanggal) <= ?";
      params.push(endDate);
    }

    // 1. Total revenue & transaction count
    const summaryRows = await query<any[]>(
      `SELECT COUNT(*) as total_transactions, COALESCE(SUM(total), 0) as total_revenue FROM transactions ${dateFilterSql}`,
      params
    );

    const totalTransactions = Number(summaryRows[0]?.total_transactions || 0);
    const totalRevenue = Number(summaryRows[0]?.total_revenue || 0);

    // 2. Items sold
    let itemsFilterSql = "";
    const itemsParams: any[] = [];
    if (dateFilterSql) {
      itemsFilterSql = ` WHERE td.transaction_id IN (SELECT id FROM transactions ${dateFilterSql})`;
      itemsParams.push(...params);
    }

    const itemsRows = await query<any[]>(
      `SELECT COALESCE(SUM(jumlah), 0) as total_items FROM transaction_details td ${itemsFilterSql}`,
      itemsParams
    );
    const totalItemsSold = Number(itemsRows[0]?.total_items || 0);

    // 3. Top selling products
    const topProducts = await query<any[]>(
      `SELECT 
        p.nama_barang,
        p.kategori,
        COALESCE(SUM(td.jumlah), 0) as total_qty,
        COALESCE(SUM(td.subtotal), 0) as total_sales
       FROM transaction_details td
       JOIN products p ON td.product_id = p.id
       ${itemsFilterSql}
       GROUP BY p.id, p.nama_barang, p.kategori
       ORDER BY total_qty DESC
       LIMIT 5`,
      itemsParams
    );

    // 4. Sales by category
    const categorySummary = await query<any[]>(
      `SELECT 
        p.kategori,
        COALESCE(SUM(td.jumlah), 0) as total_qty,
        COALESCE(SUM(td.subtotal), 0) as total_sales
       FROM transaction_details td
       JOIN products p ON td.product_id = p.id
       ${itemsFilterSql}
       GROUP BY p.kategori
       ORDER BY total_sales DESC`,
      itemsParams
    );

    return NextResponse.json({
      success: true,
      data: {
        total_transactions: totalTransactions,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        top_products: topProducts.map((tp) => ({
          nama_barang: tp.nama_barang,
          kategori: tp.kategori,
          total_qty: Number(tp.total_qty),
          total_sales: Number(tp.total_sales),
        })),
        category_summary: categorySummary.map((cs) => ({
          kategori: cs.kategori,
          total_qty: Number(cs.total_qty),
          total_sales: Number(cs.total_sales),
        })),
      },
    });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Gagal memproses laporan: " + error.message },
      { status: 500 }
    );
  }
}
