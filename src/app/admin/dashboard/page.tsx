"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/admindashboard.css";
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

  const [, setRekapData] = useState<RekapDataItem[]>([]);
  const [bulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun] = useState<number>(new Date().getFullYear());

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) { router.push("/"); return; }
        const data = await res.json();
        
        if (data.role !== "admin" && data.role !== "superadmin") {
          router.push("/"); return;
        }
        setUser({ name: data.name, role: data.role });
      } catch (error) { router.push("/"); }
    };

    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/admin/summary");
        if (res.ok) {
            const data = await res.json();
            setSummary(data);
        }
      } catch (error) {}
    };

    fetchUser();
    fetchSummary();
  }, [router]);

  useEffect(() => {
    const fetchRekapBulanan = async () => {
      try {
        const res = await fetch(`/api/admin/rekap-bulanan?bulan=${bulan}&tahun=${tahun}`);
        if (res.ok) {
            const data = await res.json();
            setRekapData(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchRekapBulanan();
  }, [bulan, tahun]);

  return (
    // HAPUS style paddingLeft manual disini, karena sudah diurus Layout
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Dashboard Admin</h1>
        {user ? (
          <>
            <p>Selamat datang, <span className="highlight">{user.name}</span>! 🎉</p>
            <p>Posisi: <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong></p>
            <p>Di sini kamu bisa mengelola data karyawan, melihat data absensi, dan membuat laporan.</p>
          </>
        ) : ( <p>Memuat data user...</p> )}
      </div>

      <div className="summary-card-container">
        <div className="summary-card blue" onClick={() => router.push("/admin/karyawan")}>
          <h3>Total Karyawan</h3><p>{summary.totalKaryawan}</p>
        </div>
        <div className="summary-card green" onClick={() => router.push("/admin/pengajuan")}>
          <h3>Pengajuan Izin</h3><p>{summary.totalPengajuan}</p>
        </div>
        <div className="summary-card red" onClick={() => router.push("/admin/absensi")}>
          <h3>Absensi Hari Ini</h3><p>{summary.absenMasukHariIni}</p>
        </div>
        <div className="summary-card yellow" onClick={() => router.push("/admin/pengajuan")}>
          <h3>Karyawan Izin Hari Ini</h3><p>{summary.izinHariIni}</p>
        </div>
        <div className="summary-card purple" onClick={() => router.push("/admin/pengajuan")}>
          <h3>Pengajuan Pending</h3><p>{summary.pendingPengajuan}</p>
        </div>
      </div>

      <RekapBulananCard/>
    </div>
  );
}