"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Sidebar";
import KaryawanLayout from "@/components/KaryawanLayout";
import SisaCutiCard from "@/components/SisaCutiCard";
import "../../../styles/dashboard.css";

export default function KaryawanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();

        if (data.role !== "karyawan") {
          router.push("/");
          return;
        }

        setUser({ name: data.name, role: data.role });
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  return (
    <>
      <Navbar role={"karyawan"} />
      <KaryawanLayout>
        <div className="dashboard-container">
          <div className="dashboard-card">
            <h1>Dashboard Karyawan</h1>
            {user ? (
              <>
                <p>
                  Halo, <span className="highlight">{user.name}</span>! 👋
                </p>
                <p>
                  Posisi: <strong>{user.role}</strong>
                </p>
                <p>
                  Silakan melakukan absen masuk atau absen pulang di halaman
                  ini. Semangat bekerja ya!
                </p>
              </>
            ) : (
              <p>Memuat data user...</p>
            )}
          </div>
          <br />

          <div className="dashboard-card">
            {user ? <SisaCutiCard /> : <p>Memuat data user...</p>}
          </div>
        </div>
      </KaryawanLayout>
    </>
  );
}
