"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import Swal from "sweetalert2"; 
import PhotoPreviewModal from "@/components/PhotoPreviewModal";
import "@/styles/absensipage.css";

interface AbsensiTableProps {
  absensi: {
    id: string;
    user: { name: string };
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    photo?: string | null;
    lateMinutes?: number;
  }[];
}

export default function AbsensiTable({ absensi }: AbsensiTableProps) {
  const router = useRouter(); 
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  // Helper Style Status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "hadir": return { backgroundColor: "#dcfce7", color: "#166534" }; // Hijau
      case "sakit": return { backgroundColor: "#ffedd5", color: "#9a3412" }; // Orange
      case "izin": return { backgroundColor: "#dbeafe", color: "#1e40af" }; // Biru
      case "cuti": return { backgroundColor: "#f3e8ff", color: "#6b21a8" }; // Ungu
      case "alpha": return { backgroundColor: "#fee2e2", color: "#991b1b" }; // Merah
      default: return { backgroundColor: "#f3f4f6", color: "#374151" }; // Abu
    }
  };

  // Fungsi Edit Status
  const handleEditStatus = async (id: string, currentStatus: string, name: string) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Ubah Status Absensi',
      text: `Ubah status untuk karyawan: ${name}`,
      input: 'select',
      inputOptions: {
        'hadir': 'Hadir',
        'sakit': 'Sakit',
        'izin': 'Izin',
        'cuti': 'Cuti',
        'alpha': 'Alpha'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      allowOutsideClick: false,
      
      // --- PERBAIKAN TAMPILAN (CSS FIX) ---
      // Fungsi ini akan dijalankan saat modal terbuka untuk memperbaiki style input
      didOpen: () => {
        const input = Swal.getInput(); // Ambil elemen dropdown
        if (input) {
            // Paksa lebar agar tidak bablas keluar modal
            input.style.width = '80%'; 
            input.style.maxWidth = '100%';
            input.style.margin = '1em auto'; // Tengah
            input.style.display = 'block';
            input.style.boxSizing = 'border-box';
            input.style.fontSize = '16px';
            input.style.padding = '8px';
        }
      },
      
      inputValidator: (value) => {
        if (!value) {
          return 'Anda harus memilih status!';
        }
      }
    });

    // Jika user menekan tombol Batal / Close
    if (!newStatus) return;

    // Jika user menekan Simpan TAPI statusnya sama saja
    if (newStatus === currentStatus) {
        Swal.fire('Info', 'Tidak ada perubahan status.', 'info');
        return;
    }

    // Eksekusi Update ke Server
    try {
        Swal.fire({
            title: 'Menyimpan...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const res = await fetch(`/api/absensi/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `Status berhasil diubah menjadi ${newStatus}.`,
            timer: 1500,
            showConfirmButton: false
          });
          
          router.refresh(); // Refresh data tabel
        } else {
          throw new Error("Gagal update");
        }
    } catch (error) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghubungi server.', 'error');
    }
  };

  return (
    <>
      <table className="styled-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Jam Pulang</th>
            <th>Status</th>
            <th>Foto</th>
            <th>Aksi</th> 
          </tr>
        </thead>
        <tbody>
          {absensi.length > 0 ? (
            absensi.map((a, index) => (
              <tr key={a.id}>
                <td>{index + 1}</td>
                <td>{a.user.name}</td>
                <td>{new Date(a.date).toLocaleDateString("id-ID")}</td>
                <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                <td>
                  <span style={{
                      padding: "4px 10px",
                      borderRadius: "15px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      ...getStatusStyle(a.status)
                  }}>
                      {a.status}
                  </span>
                </td>
                <td>
                  {a.photo ? (
                    <button 
                      className="add-button" 
                      style={{ backgroundColor: "#3b82f6", padding: "5px 10px", fontSize: "12px" }} 
                      onClick={() => setPhotoModal(a.photo ?? null)}
                    >
                      Lihat
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                      onClick={() => handleEditStatus(a.id, a.status, a.user.name)}
                      style={{
                        background: "white",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#333",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                      title="Ubah Status"
                      onMouseOver={(e) => e.currentTarget.style.background = "#f9fafb"}
                      onMouseOut={(e) => e.currentTarget.style.background = "white"}
                    >
                      ✏️ Edit
                    </button>
                </td>
              </tr>
            ))
          ) : (
             <tr>
                <td colSpan={8} style={{textAlign: "center", padding: "20px", color: "#666"}}>
                    Tidak ada data absensi yang ditemukan.
                </td>
             </tr>
          )}
        </tbody>
      </table>

      {photoModal && (
        <PhotoPreviewModal
          photo={photoModal}
          onClose={() => setPhotoModal(null)}
        />
      )}
    </>
  );
}