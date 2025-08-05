"use client";

import React, { useEffect, useState } from "react";
import UserInfoCard from "@/components/UserInfoCard";
import Clock from "@/components/Clock";
import Link from "next/link";
import CameraModal from "@/components/CameraModal";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";  
import "../../../styles/dashboard.css";
import "@/styles/modal.css"

type AbsensiBulanan = {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  keterangan: string;
  lateMinutes: number | null;
  photo?: string | null;
};

export default function KaryawanAbsensiPage() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [absenStatus, setAbsenStatus] = useState<"belum" | "masuk" | "pulang">("belum");
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [jamMasuk, setJamMasuk] = useState<string | null>(null);
  const [jamPulang, setJamPulang] = useState<string | null>(null);
  const [photoHarian, setPhotoHarian] = useState<string | null>(null);  // foto harian

  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [dataBulanan, setDataBulanan] = useState<AbsensiBulanan[]>([]);

  const [photoModal, setPhotoModal] = useState<string | null>(null);  // ⬅ state untuk buka modal photo

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (!res.ok) return console.log("Gagal mengambil user info");
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/absensi/status", { credentials: "include" });
      if (!res.ok) return console.log("Gagal mengambil status absen");
      const { attendance } = await res.json();
      if (attendance?.checkOut) setAbsenStatus("pulang");
      else if (attendance?.checkIn) setAbsenStatus("masuk");
      else setAbsenStatus("belum");
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchRiwayatHarian = async () => {
      const res = await fetch(`/api/absensi/riwayat?tanggal=${tanggal}`, { credentials: "include" });
      if (!res.ok) return;
      const result = await res.json();
      if (Array.isArray(result) && result.length > 0) {
        const data = result[0];
        setJamMasuk(data.checkIn ? new Date(data.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : null);
        setJamPulang(data.checkOut ? new Date(data.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : null);
        setPhotoHarian(data.photo || null);
      } else {
        setJamMasuk(null);
        setJamPulang(null);
        setPhotoHarian(null);
      }
    };
    fetchRiwayatHarian();
  }, [tanggal, absenStatus]);

  useEffect(() => {
    const fetchBulanan = async () => {
      const res = await fetch(`/api/absensi/riwayat-bulanan?bulan=${bulan}&tahun=${tahun}`, { credentials: "include" });
      if (!res.ok) return console.log("Gagal mengambil riwayat bulanan");
      const data = await res.json();
      setDataBulanan(data);
    };
    fetchBulanan();
  }, [bulan, tahun]);

  const handleClockIn = () => {
    setCameraOpen(true);
  };

  const handleClockOut = async () => {
    setLoading(true);
    const res = await fetch("/api/absensi/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      setAbsenStatus("pulang");
      alert("Absen pulang berhasil!");
    } else {
      alert("Gagal absen pulang");
    }
    setLoading(false);
  };

  const handleCaptureComplete = async (photoData: string, location: GeolocationPosition | null) => {
    setLoading(true);
    const res = await fetch("/api/absensi/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        photo: photoData,
        latitude: location?.coords.latitude ?? null,
        longitude: location?.coords.longitude ?? null,
      }),
    });

    if (res.ok) {
      setAbsenStatus("masuk");
      alert("Absen masuk berhasil!");
      setCameraOpen(false);
    } else {
      alert("Gagal absen masuk.");
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ position: "relative" }}>
      {user && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000 }}>
          <UserInfoCard name={user.name} role={user.role} />
        </div>
      )}

      <div className="dashboard-card" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <Clock />
        <p>Status hari ini: <strong>{absenStatus}</strong></p>

        {absenStatus === "belum" && (
          <button onClick={handleClockIn} className="add-button" style={{ backgroundColor: "#22c55e" }}>
            {loading ? "Memproses..." : "Absen Masuk"}
          </button>
        )}

        {absenStatus === "masuk" && (
          <button onClick={handleClockOut} className="add-button" style={{ backgroundColor: "#facc15", color: "#000" }}>
            {loading ? "Memproses..." : "Absen Pulang"}
          </button>
        )}

        {absenStatus === "pulang" && (
          <p style={{ marginTop: 16 }}>Terima kasih, Anda sudah absen pulang hari ini.</p>
        )}

        <div style={{ marginTop: 16 }}>
          <Link href="/karyawan/dashboard">
            <button className="add-button" style={{ backgroundColor: "#3b82f6" }}>
              ← Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>

      <CameraModal 
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCaptureComplete}
      />

      {/* Riwayat Harian */}
      <div className="dashboard-card" style={{ marginTop: 24 }}>
        <h3 style={{ color: "#1e40af" }}>Riwayat Absensi Per Hari</h3>
        <div className="filter-card">
          <label htmlFor="tanggal" className="filter-label">Pilih Tanggal</label>
          <input type="date" id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="filter-input" />
        </div>
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Tanggal</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Jam Masuk</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Jam Pulang</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Foto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {new Date(tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{jamMasuk || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{jamPulang || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {photoHarian ? (
                  <button className="add-button" style={{ backgroundColor: "#3b82f6" }} onClick={() => setPhotoModal(photoHarian)}>
                    Lihat Foto
                  </button>
                ) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Riwayat Bulanan */}
      <div className="dashboard-card" style={{ marginTop: 24 }}>
  <h3 style={{ color: "#1e40af" }}>Riwayat Absensi Per Bulan</h3>
  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
    <div className="filter-card" style={{ marginBottom: 0 }}>
      <label className="filter-label">Pilih Bulan</label>
      <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="filter-input">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
          <option key={b} value={b}>
            {new Date(0, b - 1).toLocaleString("id-ID", { month: "long" })}
          </option>
        ))}
      </select>
    </div>
    <div className="filter-card" style={{ marginBottom: 0 }}>
      <label className="filter-label">Pilih Tahun</label>
      <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="filter-input" style={{ maxWidth: 120 }} />
    </div>
  </div>

  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
    <thead>
      <tr style={{ backgroundColor: "#f3f4f6" }}>
        <th style={{ border: "1px solid #ccc", padding: 8 }}>Tanggal</th>
        <th style={{ border: "1px solid #ccc", padding: 8 }}>Jam Masuk</th>
        <th style={{ border: "1px solid #ccc", padding: 8 }}>Jam Pulang</th>
        <th style={{ border: "1px solid #ccc", padding: 8 }}>Terlambat (menit)</th> 
      </tr>
    </thead>
    <tbody>
      {dataBulanan.length > 0 ? (
        dataBulanan.map((absen) => (
          <tr key={absen.id}>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              {new Date(absen.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              {absen.checkIn ? new Date(absen.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              {absen.checkOut ? new Date(absen.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              {absen.lateMinutes != null ? `${absen.lateMinutes} menit` : "-"}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
            Tidak ada data absensi bulan ini.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {photoModal && (
        <PhotoPreviewModal photo={photoModal} onClose={() => setPhotoModal(null)} />
      )}
    </div>
  );
}
