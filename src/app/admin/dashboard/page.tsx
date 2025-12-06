"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/admindashboard.css";
import "@/styles/absensiChart.css";
import RekapBulananCard from "@/components/RekapBulananCard";


interface SummaryData {
  totalKaryawan: number;
  totalPengajuan: number;
  izinHariIni: number;
  absenMasukHariIni: number;
  pendingPengajuan: number;
}

interface RekapDataItem {
  nama: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [summary, setSummary] = useState<SummaryData>({
    totalKaryawan: 0,
    totalPengajuan: 0,
    izinHariIni: 0,
    absenMasukHariIni: 0,
    pendingPengajuan: 0,
  });

  const [chartData, setChartData] = useState<
    { tanggal: string; jumlah: number }[]
  >([]);

  const [, setRekapData] = useState<RekapDataItem[]>([]);
  const [bulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun] = useState<number>(new Date().getFullYear());

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/");
          return;
        }

        setUser({ name: data.name, role: data.role });
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        router.push("/");
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/admin/summary");
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error("Gagal mengambil data ringkasan dashboard:", error);
      }
    };

    const fetchChart = async () => {
      try {
        const res = await fetch("/api/admin/statistik-absensi");
        const data = await res.json();
        setChartData(data);
      } catch (err) {
        console.error("Gagal mengambil data grafik absensi:", err);
      }
    };

    fetchUser();
    fetchSummary();
    fetchChart();
  }, [router]);

  useEffect(() => {
    const fetchRekapBulanan = async () => {
      try {
        const res = await fetch(
          `/api/admin/rekap-absensi?bulan=${bulan}&tahun=${tahun}`
        );
        const data = await res.json();
        setRekapData(data);
      } catch (err) {
        console.error("Gagal mengambil rekap absensi:", err);
      }
    };

    fetchRekapBulanan();
  }, [bulan, tahun]);

  return (
    <div className="dashboard-container" style={{ paddingLeft: "240px" }}>
      <div className="dashboard-card">
        <h1>Dashboard Admin</h1>
        {user ? (
          <>
            <p>
              Selamat datang, <span className="highlight">{user.name}</span>! 🎉
            </p>
            <p>
              Posisi: <strong>{user.role}</strong>
            </p>
            <p>
              Di sini kamu bisa mengelola data karyawan, melihat data absensi,
              dan membuat laporan.
            </p>
          </>
        ) : (
          <p>Memuat data user...</p>
        )}
      </div>

      <div className="summary-card-container">
        <div
          className="summary-card blue"
          onClick={() => router.push("/admin/karyawan")}
        >
          <h3>Total Karyawan</h3>
          <p>{summary.totalKaryawan}</p>
        </div>
        <div
          className="summary-card green"
          onClick={() => router.push("/admin/pengajuan")}
        >
          <h3>Pengajuan Izin</h3>
          <p>{summary.totalPengajuan}</p>
        </div>
        <div
          className="summary-card red"
          onClick={() => router.push("/admin/absensi")}
        >
          <h3>Absensi Hari Ini</h3>
          <p>{summary.absenMasukHariIni}</p>
        </div>
        <div
          className="summary-card yellow"
          onClick={() => router.push("/admin/pengajuan")}
        >
          <h3>Karyawan Izin Hari Ini</h3>
          <p>{summary.izinHariIni}</p>
        </div>
        <div
          className="summary-card purple"
          onClick={() => router.push("/admin/pengajuan")}
        >
          <h3>Pengajuan Pending</h3>
          <p>{summary.pendingPengajuan}</p>
        </div>
      </div>

      {/* <div style={{ display: "flex", gap: "24px", marginTop: "32px" }}>
        <div className="grafik-absensi-card">
          <h3>Grafik Absensi 7 Hari Terakhir</h3>
          <div className="grafik-wrapper">
            {[...chartData].reverse().map((item) => (
              <div key={item.tanggal} className="grafik-bar-item">
                <span className="grafik-label">{item.tanggal}</span>
                <div className="grafik-bar-container">
                  <div
                    className="grafik-bar"
                    style={{ width: `${item.jumlah * 10}px` }}
                  >
                    {item.jumlah}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}
      <RekapBulananCard/>
    </div>
  );
}
