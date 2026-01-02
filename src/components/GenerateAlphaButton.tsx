"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import "@/styles/absensi.css";

// Opsional: Props jika ingin melakukan refresh data tabel di parent component setelah sukses
interface GenerateAlphaButtonProps {
  onSuccess?: () => void;
}

export default function GenerateAlphaButton({ onSuccess }: GenerateAlphaButtonProps) {
  const [loading, setLoading] = useState(false);
  // Default tanggal adalah hari ini (format YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerate = async () => {
    // 1. Validasi Tanggal
    if (!selectedDate) {
        Swal.fire("Error", "Mohon pilih tanggal terlebih dahulu.", "error");
        return;
    }

    // 2. Konfirmasi Ganda (SweetAlert)
    const result = await Swal.fire({
        title: "Generate Alpha?",
        html: `
            <p>Anda akan memproses data untuk tanggal: <b>${selectedDate}</b></p>
            <p>Karyawan yang <b>Punya Jadwal</b> tapi <b>Belum Absen</b> dan <b>Tidak Cuti</b> akan ditandai <b style="color:red">ALPHA</b>.</p>
            <br/>
            <p style="color: #d33; font-size: 0.85em; font-style: italic; background: #fff5f5; padding: 8px; border-radius: 4px;">
                ⚠️ <b>PENTING:</b> Pastikan hari kerja sudah berakhir sebelum menekan tombol ini agar tidak salah menandai orang yang belum pulang kerja.
            </p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Proses Sekarang!",
        cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    // 3. Eksekusi API
    setLoading(true);
    try {
      Swal.fire({ 
        title: 'Sedang Memproses...', 
        html: 'Sistem sedang mengecek jadwal, absensi, dan cuti...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading() 
      });

      const res = await fetch("/api/admin/generate-alpha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // PERUBAHAN PENTING: Key dikirim sebagai 'targetDate' sesuai API
        body: JSON.stringify({ targetDate: selectedDate }), 
      });

      const data = await res.json();

      if (res.ok) {
        // Tampilkan Laporan Detail dari API
        await Swal.fire({
            icon: 'success',
            title: 'Selesai!',
            html: `
              <div style="text-align: left; font-size: 0.95em; line-height: 1.6;">
                <p><b>${data.message}</b></p>
                <hr style="margin: 10px 0; border-top: 1px solid #eee;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li>📅 Total Terjadwal: <b>${data.details?.totalScheduled || 0}</b></li>
                  <li>✅ Sudah Hadir: <b>${data.details?.alreadyPresent || 0}</b></li>
                  <li>🏖️ Sedang Cuti: <b>${data.details?.onLeave || 0}</b></li>
                  <li style="margin-top: 5px; color: #d33; font-weight: bold;">
                    ❌ Alpha Baru: ${data.count}
                  </li>
                </ul>
              </div>
            `,
        });

        // Trigger refresh jika ada props, atau reload halaman
        if (onSuccess) {
            onSuccess();
        } else {
            window.location.reload();
        }

      } else {
        throw new Error(data.error || "Terjadi kesalahan saat memproses.");
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Gagal menghubungi server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      
      {/* Input Tanggal */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>
            Target Tanggal:
        </label>
        <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
      </div>

      {/* Tombol Eksekusi */}
      <div style={{ marginTop: '19px' }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="generate-alpha-btn"
            style={{ 
                background: loading ? '#94a3b8' : '#ef4444', 
                color: 'white',
                padding: '9px 20px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            }}
          >
            {loading ? (
                <>⏳ Memproses...</>
            ) : (
                <>⚡ Generate Alpha</>
            )}
          </button>
      </div>
    </div>
  );
}