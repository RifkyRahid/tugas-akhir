"use client";

import Swal from 'sweetalert2';
import React, { useEffect, useState } from "react";
import UserInfoCard from "@/components/UserInfoCard";
import Clock from "@/components/Clock";
import Link from "next/link";
import CameraModal from "@/components/CameraModal";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";  
import "@/styles/dashboard.css";
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
  
  // State data
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [jamMasuk, setJamMasuk] = useState<string | null>(null);
  const [jamPulang, setJamPulang] = useState<string | null>(null);
  const [photoHarian, setPhotoHarian] = useState<string | null>(null);  

  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [dataBulanan, setDataBulanan] = useState<AbsensiBulanan[]>([]);

  const [photoModal, setPhotoModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (!res.ok) return console.log("Gagal mengambil user info");
      const data = await res.json();
      setUser({ id: data.id, name: data.name, role: data.role });
    };
    fetchUser();
  }, []);

  const fetchStatus = async () => {
    try {
        const res = await fetch("/api/absensi/status", { credentials: "include" });
        if (!res.ok) return;
        const { attendance } = await res.json();
        
        if (attendance?.checkOut) setAbsenStatus("pulang");
        else if (attendance?.checkIn) setAbsenStatus("masuk");
        else setAbsenStatus("belum");
    } catch (error) {
        console.error("Gagal load status");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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

  useEffect(() => {
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
    Swal.fire({
        title: 'Memproses Absen Pulang...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const res = await fetch("/api/absensi/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      setAbsenStatus("pulang");
      fetchStatus();
      fetchRiwayatHarian();
      Swal.fire({ icon: 'success', title: 'Absen pulang berhasil!', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal absen pulang', text: 'Silakan coba lagi.' });
    }
  };

  // Konversi base64 ke File
  function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  // --- LOGIKA UTAMA BARU: Handle Absen Masuk dengan Popup Alasan ---
  const handleCaptureComplete = async (photoData: string, location: GeolocationPosition | null) => {
    // 1. Loading Verifikasi
    Swal.fire({
        title: 'Memverifikasi Lokasi...',
        html: 'Sistem sedang mengecek posisi Anda.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const photoFile = base64ToFile(photoData, `absen-${Date.now()}.png`);
        const formData = new FormData();
        formData.append("photo", photoFile);
        formData.append("latitude", String(location?.coords.latitude ?? ""));
        formData.append("longitude", String(location?.coords.longitude ?? ""));
        // CATATAN: Kita TIDAK kirim alasan di sini dulu.

        const res = await fetch("/api/absensi/checkin", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const result = await res.json();
        setCameraOpen(false); // Tutup kamera apapun hasilnya

        if (res.ok) {
            // SKENARIO 1: DILUAR JANGKAUAN (PENDING)
            if (result.status === 'pending') {
                 // Munculkan Popup Input Alasan
                 const { value: alasanUser } = await Swal.fire({
                    icon: 'warning',
                    title: 'Anda Diluar Lokasi!',
                    html: `
                        Anda tidak berada di lokasi absen yang seharusnya: <b>${result.areaName || 'Kantor'}</b>.<br>
                        Absensi Anda akan berstatus <b>PENDING</b>.<br><br>
                        Silakan masukkan alasan kenapa Anda absen diluar lokasi:
                    `,
                    input: 'textarea',
                    inputPlaceholder: 'Contoh: Sedang meeting di klien, WFH karena sakit, dll...',
                    inputAttributes: {
                        'aria-label': 'Tulis alasan Anda disini'
                    },
                    showCancelButton: false, // User dipaksa isi atau close (tetap pending default)
                    confirmButtonText: 'Kirim Alasan',
                    allowOutsideClick: false,
                    inputValidator: (value) => {
                        if (!value) {
                          return 'Anda wajib mengisi alasan!';
                        }
                    }
                 });

                 if (alasanUser) {
                     // Kirim Alasan ke Backend via PATCH
                     await fetch("/api/absensi/checkin", {
                         method: "PATCH",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ 
                             attendanceId: result.attendanceId,
                             reason: alasanUser 
                         })
                     });

                     Swal.fire({
                         icon: 'success',
                         title: 'Terkirim',
                         text: 'Absensi dan alasan Anda telah dikirim ke Admin untuk persetujuan.',
                     });
                 }
                 setAbsenStatus("masuk"); 

            // SKENARIO 2: DALAM JANGKAUAN (SUKSES)
            } else {
                 Swal.fire({
                    icon: 'success',
                    title: 'Absen Berhasil!',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                 });
                 setAbsenStatus("masuk");
            }
            
            // Refresh Data
            fetchStatus();
            fetchRiwayatHarian();
            
        } else {
          // Error Lain (Misal sudah absen)
          Swal.fire({
            icon: 'error',
            title: 'Gagal Absen',
            text: result.message || 'Terjadi kesalahan sistem.',
          });
        }

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal terhubung ke server.',
        });
    }
  };

  return (
    <div className="page-container" style={{ position: "relative", paddingBottom: "50px" }}>
      {user && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000 }}>
          <UserInfoCard name={user.name} role={user.role} />
        </div>
      )}

      <div className="dashboard-card" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <Clock />
        <p style={{marginBottom: '15px'}}>Status: <strong style={{textTransform:'capitalize'}}>{absenStatus}</strong></p>

        {absenStatus === "belum" && (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {/* Input Manual Dihapus, tombol langsung full width */}
            <button onClick={handleClockIn} className="add-button" style={{ backgroundColor: "#22c55e", width: '100%' }}>
              📷 Absen Masuk
            </button>
          </div>
        )}

        {absenStatus === "masuk" && (
          <button onClick={handleClockOut} className="add-button" style={{ backgroundColor: "#facc15", color: "#000" }}>
            Absen Pulang
          </button>
        )}

        {absenStatus === "pulang" && (
          <p style={{ marginTop: 16, color: 'green', fontWeight:'bold' }}>
             Terima kasih, Anda sudah absen pulang.
          </p>
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
        <h3 style={{ color: "#1e40af" }}>Riwayat Hari Ini</h3>
        <div className="filter-card">
          <label htmlFor="tanggal" className="filter-label">Tanggal</label>
          <input type="date" id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="filter-input" />
        </div>
        <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Masuk</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Pulang</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Foto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign:'center' }}>{jamMasuk || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign:'center' }}>{jamPulang || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign:'center' }}>
                {photoHarian ? (
                  <button 
                    style={{ backgroundColor: "#3b82f6", color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' }} 
                    onClick={() => setPhotoModal(photoHarian)}
                  >
                    Lihat
                  </button>
                ) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Riwayat Bulanan */}
      <div className="dashboard-card" style={{ marginTop: 24 }}>
        <h3 style={{ color: "#1e40af" }}>Riwayat Bulanan</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="filter-input">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
                <option key={b} value={b}>
                    {new Date(0, b - 1).toLocaleString("id-ID", { month: "long" })}
                </option>
                ))}
            </select>
            <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="filter-input" style={{ width: '80px' }} />
        </div>

        <div style={{overflowX: 'auto'}}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th style={{ border: "1px solid #ccc", padding: 8, fontSize:'14px' }}>Tgl</th>
                    <th style={{ border: "1px solid #ccc", padding: 8, fontSize:'14px' }}>Masuk</th>
                    <th style={{ border: "1px solid #ccc", padding: 8, fontSize:'14px' }}>Status</th>
                </tr>
                </thead>
                <tbody>
                {dataBulanan.length > 0 ? (
                    dataBulanan.map((absen) => (
                    <tr key={absen.id}>
                        <td style={{ border: "1px solid #ccc", padding: 8, fontSize:'13px' }}>
                        {new Date(absen.date).getDate()}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: 8, fontSize:'13px' }}>
                        {absen.checkIn ? new Date(absen.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: 8, fontSize:'12px' }}>
                            {absen.status === 'pending' ? (
                                <span style={{color:'orange', fontWeight:'bold'}}>Pending</span>
                            ) : (
                                <span style={{color:'green'}}>Hadir</span>
                            )}
                            {absen.lateMinutes ? <div style={{color:'red', fontSize:'10px'}}>Telat {absen.lateMinutes}m</div> : null}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: 16 }}>
                        Tidak ada data.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>

      {photoModal && (
        <PhotoPreviewModal photo={photoModal} onClose={() => setPhotoModal(null)} />
      )}
    </div>
  );
}