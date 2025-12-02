"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";

export default function PengaturanPage() {
  const [jamMasuk, setJamMasuk] = useState("09:00");
  const [jamPulang, setJamPulang] = useState("17:00");
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data saat halaman dibuka
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setJamMasuk(data.startWorkTime);
          setJamPulang(data.endWorkTime);
        }
      } catch (error) {
        console.error("Gagal load setting");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Loading
    Swal.fire({
        title: 'Menyimpan...',
        didOpen: () => Swal.showLoading()
    });

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startWorkTime: jamMasuk,
          endWorkTime: jamPulang
        }),
      });

      if (res.ok) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Jam kerja berhasil diperbarui.',
            timer: 1500,
            showConfirmButton: false
        });
      } else {
        throw new Error("Gagal simpan");
      }
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="page-header" style={{marginBottom: '30px'}}>
        <h1 className="page-title">Pengaturan Aplikasi</h1>
        <p style={{color:'#666'}}>Atur jam kerja global untuk seluruh karyawan.</p>
      </div>

      <div style={{
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          maxWidth: '500px'
      }}>
        {isLoading ? (
            <p>Memuat pengaturan...</p>
        ) : (
            <form onSubmit={handleSimpan}>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display:'block', fontWeight:'bold', marginBottom:'8px'}}>Jam Masuk (Start)</label>
                    <input 
                        type="time" 
                        value={jamMasuk}
                        onChange={(e) => setJamMasuk(e.target.value)}
                        style={{
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: '5px', 
                            border: '1px solid #ccc',
                            fontSize: '16px'
                        }}
                        required
                    />
                    <small style={{color:'#888'}}>Absen setelah jam ini akan dihitung Terlambat.</small>
                </div>

                <div style={{marginBottom: '30px'}}>
                    <label style={{display:'block', fontWeight:'bold', marginBottom:'8px'}}>Jam Pulang (End)</label>
                    <input 
                        type="time" 
                        value={jamPulang}
                        onChange={(e) => setJamPulang(e.target.value)}
                        style={{
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: '5px', 
                            border: '1px solid #ccc',
                            fontSize: '16px'
                        }}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '100%'
                    }}
                >
                    💾 Simpan Perubahan
                </button>
            </form>
        )}
      </div>
    </AdminLayout>
  );
}