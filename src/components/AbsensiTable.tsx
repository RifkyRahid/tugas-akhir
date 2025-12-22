"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import Swal from "sweetalert2"; 
import PhotoPreviewModal from "@/components/PhotoPreviewModal";
import MapModal from "@/components/MapModal"; // Import Modal Peta
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
    // TAMBAHAN: Koordinat Lokasi
    latitude?: number | null;
    longitude?: number | null;
  }[];
  userRole?: string; 
}

export default function AbsensiTable({ absensi, userRole = "admin" }: AbsensiTableProps) {
  const router = useRouter(); 
  const [photoModal, setPhotoModal] = useState<string | null>(null);
  
  // STATE BARU: Untuk Map Modal
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "hadir": return { backgroundColor: "#dcfce7", color: "#166534" }; 
      case "sakit": return { backgroundColor: "#ffedd5", color: "#9a3412" }; 
      case "izin": return { backgroundColor: "#dbeafe", color: "#1e40af" }; 
      case "cuti": return { backgroundColor: "#f3e8ff", color: "#6b21a8" }; 
      case "alpha": return { backgroundColor: "#fee2e2", color: "#991b1b" }; 
      case "terlambat": return { backgroundColor: "#fff7ed", color: "#c2410c" }; // Opsional
      default: return { backgroundColor: "#f3f4f6", color: "#374151" }; 
    }
  };

  // --- HANDLER BARU: BUKA PETA ---
  const openMap = (lat: number | null, lng: number | null, name: string) => {
    if (!lat || !lng) {
        Swal.fire("Info", "Lokasi tidak ditemukan untuk absen ini.", "info");
        return;
    }
    setSelectedLocation({ lat, lng, name });
    setMapOpen(true);
  };

  // --- FITUR LAMA: EDIT STATUS ---
  const handleEditStatus = async (id: string, currentStatus: string, name: string) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Ubah Status',
      text: `Karyawan: ${name}`,
      input: 'select',
      inputOptions: { 'hadir': 'Hadir', 'sakit': 'Sakit', 'izin': 'Izin', 'cuti': 'Cuti', 'alpha': 'Alpha' },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#3b82f6',
    });

    if (!newStatus || newStatus === currentStatus) return;

    try {
        Swal.showLoading();
        const res = await fetch(`/api/absensi/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          Swal.fire('Berhasil', 'Status diubah', 'success');
          router.refresh(); 
        }
    } catch (e) { Swal.fire('Error', 'Gagal', 'error'); }
  };

  // --- FITUR LAMA: EDIT WAKTU (SUPERADMIN ONLY) ---
  const handleEditTime = async (id: string, checkIn: string | null, checkOut: string | null, name: string) => {
    const toLocalInput = (isoString: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const defaultIn = toLocalInput(checkIn);
    const defaultOut = toLocalInput(checkOut);

    const { value: formValues } = await Swal.fire({
        title: 'Superadmin Edit Waktu',
        html: `
            <div style="text-align: left; font-size: 14px; color: #333;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Jam Masuk</label>
                <input id="swal-in" type="datetime-local" class="swal2-input" style="margin: 0 0 15px 0; width: 100%; box-sizing: border-box;" value="${defaultIn}">
                
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Jam Pulang</label>
                <input id="swal-out" type="datetime-local" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" value="${defaultOut}">
                <small style="color: #666;">*Kosongkan Jam Pulang jika ingin di-reset</small>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Simpan Perubahan',
        confirmButtonColor: '#d97706',
        preConfirm: () => {
            const inputIn = (document.getElementById('swal-in') as HTMLInputElement).value;
            const inputOut = (document.getElementById('swal-out') as HTMLInputElement).value;
            
            if (!inputIn) {
                Swal.showValidationMessage('Jam Masuk tidak boleh kosong (setidaknya tanggal)');
            }
            return { 
                newCheckIn: inputIn ? new Date(inputIn).toISOString() : null, 
                newCheckOut: inputOut ? new Date(inputOut).toISOString() : null 
            };
        }
    });

    if (!formValues) return;

    try {
        Swal.fire({ title: 'Menyimpan Waktu...', didOpen: () => Swal.showLoading() });

        const res = await fetch(`/api/absensi/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                checkIn: formValues.newCheckIn,
                checkOut: formValues.newCheckOut
            }),
        });

        if (res.ok) {
            await Swal.fire('Berhasil!', `Waktu absensi ${name} telah diperbarui.`, 'success');
            router.refresh();
        } else {
            throw new Error('Gagal update');
        }
    } catch (error) {
        Swal.fire('Gagal', 'Terjadi kesalahan server.', 'error');
    }
  };

  return (
    <>
      <div className="table-container">
        <table className="styled-table">
            <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Status</th>
                <th>Lokasi</th> {/* KOLOM BARU */}
                <th>Foto</th>
                <th style={{ width: "160px" }}>Aksi</th> 
            </tr>
            </thead>
            <tbody>
            {absensi.length > 0 ? (
                absensi.map((a, index) => (
                <tr key={a.id}>
                    <td>{index + 1}</td>
                    <td>{a.user.name}</td>
                    <td>{new Date(a.date).toLocaleDateString("id-ID")}</td>
                    
                    {/* Jam Masuk */}
                    <td>
                        {a.checkIn ? (
                            <span style={{ color: (a.lateMinutes && a.lateMinutes > 0) ? "red" : "green", fontWeight: "bold" }}>
                                {new Date(a.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                {(a.lateMinutes && a.lateMinutes > 0) ? <span style={{fontSize:'10px', display:'block'}}>Telat {a.lateMinutes}m</span> : null}
                            </span>
                        ) : "-"}
                    </td>

                    {/* Jam Pulang */}
                    <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    
                    {/* Status Badge */}
                    <td>
                    <span style={{
                        padding: "4px 10px", borderRadius: "15px", fontSize: "12px",
                        fontWeight: "600", textTransform: "capitalize",
                        ...getStatusStyle(a.status)
                    }}>
                        {a.status}
                    </span>
                    </td>

                    {/* KOLOM LOKASI (BARU) */}
                    <td style={{textAlign: 'center'}}>
                        {a.latitude && a.longitude ? (
                            <button 
                                onClick={() => openMap(a.latitude ?? null, a.longitude ?? null, a.user.name)}
                                title="Lihat Peta"
                                style={{
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    fontSize: '18px',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                📍
                            </button>
                        ) : (
                            <span style={{color: '#d1d5db', fontSize: '14px', cursor: 'not-allowed'}} title="Lokasi tidak tersedia">✖</span>
                        )}
                    </td>

                    {/* Foto */}
                    <td>
                    {a.photo ? (
                        <button 
                        className="add-button" 
                        style={{ backgroundColor: "#3b82f6", padding: "5px 10px", fontSize: "12px" }} 
                        onClick={() => setPhotoModal(a.photo ?? null)}
                        >
                        Lihat
                        </button>
                    ) : "-"}
                    </td>

                    {/* Aksi */}
                    <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {/* Edit Status */}
                        <button
                            onClick={() => handleEditStatus(a.id, a.status, a.user.name)}
                            className="action-btn-edit"
                            title="Ubah Status"
                        >
                            ✏️
                        </button>

                        {/* Edit Waktu (Superadmin) */}
                        {userRole === 'superadmin' && (
                            <button
                                onClick={() => handleEditTime(a.id, a.checkIn, a.checkOut, a.user.name)}
                                className="action-btn-time"
                                title="Superadmin: Ubah Waktu"
                                style={{
                                    background: "#fef3c7", border: "1px solid #d97706", color: "#d97706"
                                }}
                            >
                                🕒
                            </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={9} style={{textAlign: "center", padding: "20px", color: "#666"}}>
                        Tidak ada data absensi.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
      
      {/* STYLE TAMBAHAN */}
      <style jsx>{`
        .action-btn-edit, .action-btn-time {
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            border: 1px solid #ccc;
            background: white;
            transition: all 0.2s;
        }
        .action-btn-edit:hover { background: #f3f4f6; }
        .action-btn-time:hover { background: #fde68a !important; }
      `}</style>

      {/* MODAL FOTO */}
      {photoModal && (
        <PhotoPreviewModal
          photo={photoModal}
          onClose={() => setPhotoModal(null)}
        />
      )}

      {/* MODAL PETA (BARU) */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={selectedLocation?.lat || null}
        lng={selectedLocation?.lng || null}
        userName={selectedLocation?.name || ""}
      />
    </>
  );
}