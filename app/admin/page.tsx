"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

type User = {
  id: number;
  nama: string;
  username: string;
  role: "admin" | "petugas";
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("user");
    router.replace("/login");
  }

  if (loading || !user) {
    return (
      <main className="admin-loading">
        <div className="loading-box">
          <div className="loading-logo">K</div>
          <p>Memuat dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">K</div>

          <div>
            <strong>KasirKu</strong>
            <span>Point of Sale</span>
          </div>
        </div>

        <div className="sidebar-role">
          <span className="role-dot"></span>
          <div>
            <small>LOGIN SEBAGAI</small>
            <strong>Administrator</strong>
          </div>
        </div>

        <nav className="sidebar-nav">

          <p className="nav-label">MENU UTAMA</p>

          <button className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item"
            onClick={() => router.push("/admin/barang")}
          >
            <span className="nav-icon">▦</span>
            <span>Data Barang</span>
          </button>

          <button
            className="nav-item"
            onClick={() => router.push("/admin/stok")}
          >
            <span className="nav-icon">↕</span>
            <span>Update Stok</span>
          </button>

          <p className="nav-label second-label">LAINNYA</p>

          <button className="nav-item">
            <span className="nav-icon">◉</span>
            <span>Profil Admin</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-mini-profile">
            <div className="mini-avatar">
              {user.nama.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.nama}</strong>
              <span>@{user.username}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Keluar
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="admin-content">

        <header className="admin-header">

          <div>
            <p className="header-eyebrow">
              ADMINISTRATOR PANEL
            </p>

            <h1>
              Good evening,{" "}
              <em>{user.nama.split(" ")[0]}.</em>
            </h1>

            <p className="header-description">
              Kelola barang dan stok toko dari satu tempat.
            </p>
          </div>

          <div className="header-date">
            <span className="date-icon">◷</span>

            <div>
              <small>STATUS SISTEM</small>
              <strong>
                <i></i> Sistem aktif
              </strong>
            </div>
          </div>

        </header>

        {/* SUMMARY */}
        <section className="summary-grid">

          <div className="summary-card summary-main">
            <div className="summary-top">
              <span className="summary-label">
                DATA BARANG
              </span>

              <span className="summary-symbol">▦</span>
            </div>

            <strong className="summary-number">
              —
            </strong>

            <p>
              Total barang tersedia
            </p>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <span className="summary-label">
                STOK
              </span>

              <span className="summary-symbol">↕</span>
            </div>

            <strong className="summary-number">
              —
            </strong>

            <p>
              Total stok barang
            </p>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <span className="summary-label">
                KATEGORI
              </span>

              <span className="summary-symbol">◇</span>
            </div>

            <strong className="summary-number">
              —
            </strong>

            <p>
              Kategori barang
            </p>
          </div>

        </section>

        {/* CONTENT GRID */}
        <section className="dashboard-grid">

          {/* WELCOME CARD */}
          <div className="welcome-card">

            <div className="welcome-decoration"></div>

            <p className="card-eyebrow">
              ADMIN WORKSPACE
            </p>

            <h2>
              Everything starts
              <br />
              with <em>good stock.</em>
            </h2>

            <p>
              Pastikan data barang dan jumlah stok selalu
              diperbarui agar proses transaksi berjalan
              dengan lancar.
            </p>

            <button
              onClick={() => router.push("/admin/barang")}
              className="primary-action"
            >
              Kelola Data Barang
              <span>→</span>
            </button>

          </div>

          {/* QUICK ACTION */}
          <div className="quick-card">

            <div className="quick-heading">
              <div>
                <p className="card-eyebrow">
                  QUICK ACTION
                </p>

                <h3>Apa yang ingin kamu kelola?</h3>
              </div>
            </div>

            <button
              className="quick-item"
              onClick={() => router.push("/admin/barang")}
            >
              <div className="quick-icon">
                ▦
              </div>

              <div>
                <strong>Data Barang</strong>
                <span>
                  Tambah, edit, dan lihat barang
                </span>
              </div>

              <b>→</b>
            </button>

            <button
              className="quick-item"
              onClick={() => router.push("/admin/stok")}
            >
              <div className="quick-icon stock-icon">
                ↕
              </div>

              <div>
                <strong>Update Stok</strong>
                <span>
                  Perbarui jumlah stok barang
                </span>
              </div>

              <b>→</b>
            </button>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="admin-footer">
          <span>KasirKu Admin Panel</span>
          <span>SMK Citra Negara</span>
        </footer>

      </section>
    </main>
  );
}