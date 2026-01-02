"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import styles from "./layout/Sidebar.module.css";

// --- Interface dan Tipe Data ---
interface SidebarProps {
  // Update: Tambahkan 'superadmin' ke sini
  role: "admin" | "karyawan" | "superadmin"; 
}

type MenuItem = {
  label: string;
  href?: string;
  isLogout?: boolean;
  subMenu?: { label: string; href: string }[];
};

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  // --- Definisi Menu (Admin dan Karyawan) ---
  const menuAdmin: MenuItem[] = [
    { label: "Dashboard", href: "/admin/dashboard" },
    {
      label: "Absensi",
      subMenu: [
        { label: "Kelola Absensi", href: "/admin/absensi" },
        { label: "Absensi Pending", href: "/admin/absensi-pending" },
        { label: "Area Absensi", href: "/admin/master/area-absensi" },
      ],
    },
    {
      label: "Karyawan",
      subMenu: [
        { label: "Kelola Karyawan", href: "/admin/karyawan" },
        { label: "Pengajuan Karyawan", href: "/admin/pengajuan" },
        { label: "Shift Kerja", href: "/admin/shifts" },
        { label: "Jadwal Kerja", href: "/admin/schedules" },
      ],
    },
    {
      label: "Data Maseter",
      subMenu: [
        { label: "Struktur Organisasi", href: "/admin/master/struktur" },
        { label: "Kalender", href: "/admin/kalender" },
        { label: "Pengaturan", href: "/admin/pengaturan" },
        { label: "Kelola Admin", href: "/admin/kelola-admin" },
      ],
    },
    { label: "Logout", isLogout: true },
  ];

  const menuKaryawan: MenuItem[] = [
    { label: "Dashboard", href: "/karyawan/dashboard" },
    { label: "Absensi Saya", href: "/karyawan/absensi" },
    { label: "Ajukan Izin", href: "/karyawan/izin" },
    { label: "Profil Saya", href: "/karyawan/profil" },
    { label: "Logout", isLogout: true },
  ];

  // --- UPDATE LOGIC DI SINI ---
  // Jika role admin ATAU superadmin, pakai menuAdmin.
  const menu = (role === "admin" || role === "superadmin") ? menuAdmin : menuKaryawan;

  const sidebarClasses = `${styles.sidebar} ${isOpen ? styles.open : ""}`;

  return (
    <>
      <header className={styles.mobileHeader}>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div className={styles.mobileBrand}>HR-RAM</div>
      </header>

      <aside className={sidebarClasses}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brand}>HR-RAM</div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          </div>

          <nav className={styles.nav}>
            {menu.map((item) => {
              if (item.isLogout) {
                return (
                  <button
                    key="logout-btn"
                    className={`${styles.link} ${styles.logoutBtn}`}
                    onClick={handleLogout}
                  >
                    {item.label}
                  </button>
                );
              }
              if (item.subMenu) {
                return (
                  <div key={item.label} className={styles.menuGroup}>
                    <div className={styles.groupLabel}>{item.label}</div>
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={styles.link}
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              if (item.href) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.link}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }
              return null;
            })}
          </nav>
        </div>
      </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
}