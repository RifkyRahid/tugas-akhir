"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";
import DateRoller from "@/components/DateRoller"; 
import Swal from "sweetalert2";
import { getUserFromLocalStorage } from "@/lib/auth"; 
import "leaflet/dist/leaflet.css";

const MapLocationViewer = dynamic(
  () => import("@/components/MapLocationViewer"), 
  { ssr: false, loading: () => <p>Memuat Peta...</p> }
);

interface Absensi {
  id: string;
  date: string;
  checkIn: string;
  status: string; 
  keterangan: string | null;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null; 
  user: { 
    name: string;
    area?: {
        name: string;
        latitude: number;
        longitude: number;
        radius: number;
    }
  };
}

export default function ApprovalAbsensiPage() {
  const [data, setData] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [userRole, setUserRole] = useState(""); // Cek role

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`; 

  const [filterDate, setFilterDate] = useState<string>(localDateString);

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Cek Role saat mount
  useEffect(() => {
    const user = getUserFromLocalStorage();
    if(user) setUserRole(user.role);
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterDate]); 

  const fetchData = async () => {
    setIsLoading(true); 
    try {
        const res = await fetch(`/api/absensi/pending?date=${filterDate}`);
        const result = await res.json();
        if(Array.isArray(result)) setData(result);
        else setData([]);
    } catch (err) {
        console.error("Gagal ambil data", err);
        setData([]);
    } finally {
        setIsLoading(false); 
    }
  };

  const handleApproval = async (id: string, status: string) => {
    // status: 'hadir' (setuju) atau 'alpha' (tolak)
    const isApprove = status === 'hadir';
    
    const confirmResult = await Swal.fire({
        title: isApprove ? 'Setujui Absensi?' : 'Tolak Absensi?',
        text: isApprove 
            ? "Status akan berubah menjadi HADIR." 
            : "Status akan berubah menjadi ALPHA (Tidak Hadir).",
        icon: isApprove ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonColor: isApprove ? '#22c55e' : '#ef4444',
        confirmButtonText: isApprove ? 'Ya, Setujui!' : 'Ya, Tolak!',
    });

    if (confirmResult.isConfirmed) {
        try {
            Swal.showLoading();
            const res = await fetch("/api/absensi/approval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                Swal.fire('Berhasil', 'Data diperbarui', 'success');
                fetchData(); 
            }
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        }
    }
  };

  const handleSoftDelete = async (id: string) => {
      const confirm = await Swal.fire({
          title: 'Hapus dari Daftar?',
          text: "Data ini akan hilang dari halaman Pending, TAPI TETAP ADA di Laporan Absensi Utama.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Hapus',
          confirmButtonColor: '#d33'
      });

      if(confirm.isConfirmed) {
          try {
            const res = await fetch(`/api/absensi/pending?id=${id}`, { method: 'DELETE' });
            if(res.ok) {
                Swal.fire('Terhapus', 'Data disembunyikan dari list pending.', 'success');
                fetchData();
            } else {
                Swal.fire('Gagal', 'Hanya Superadmin yang boleh menghapus.', 'error');
            }
          } catch(e) {
              console.error(e);
          }
      }
  }

  const openMap = (item: Absensi) => {
      if (item.latitude && item.longitude && item.user.area) {
          setSelectedLocation({
              userLat: item.latitude, userLng: item.longitude,
              areaLat: item.user.area.latitude, areaLng: item.user.area.longitude,
              areaName: item.user.area.name, userName: item.user.name
          });
          setShowMapModal(true);
      } else {
          Swal.fire('Info', 'Data lokasi tidak lengkap', 'info');
      }
  }

  return (
    <>
      {/* Header sama seperti sebelumnya... */}
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <div>
            <h1 className="page-title" style={{margin:0}}>Approval Absensi</h1>
            <p style={{margin:'5px 0 0', color:'#666', fontSize:'14px'}}>
                History & Approval Absensi Luar Area.
            </p>
        </div>
        <div className="filter-date">
            <DateRoller selectedDate={filterDate} onDateChange={setFilterDate} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="styled-table">
            <thead>
            <tr>
                <th>Nama Karyawan</th>
                <th>Waktu & Alasan</th>
                <th>Status Saat Ini</th> {/* Kolom Baru */}
                <th>Lokasi / Foto</th>
                <th>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {isLoading ? (
                <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>Loading...</td></tr>
            ) : data.length > 0 ? (
                data.map((item) => (
                <tr key={item.id} style={{backgroundColor: item.status !== 'pending' ? '#f9fafb' : 'white'}}>
                    <td>
                        <strong>{item.user.name}</strong><br/>
                        <span style={{fontSize:'12px', color:'#666'}}>
                            {item.user.area?.name || "Area ?"}
                        </span>
                    </td>
                    <td>
                        {new Date(item.checkIn).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                        <br/>
                        <span style={{color: '#d9534f', fontStyle:'italic', fontSize:'13px'}}>
                            "{item.keterangan || '-'}"
                        </span>
                    </td>
                    
                    {/* STATUS & HISTORY */}
                    <td>
                        {item.status === 'pending' ? (
                            <span className="status-badge pending">⏳ Menunggu</span>
                        ) : (
                            <div style={{fontSize:'12px'}}>
                                <span className={`status-badge ${item.status === 'hadir' ? 'disetujui' : 'ditolak'}`}>
                                    {item.status === 'hadir' ? '✔ DISETUJUI' : '✖ DITOLAK'}
                                </span>
                                <div style={{marginTop:'4px', color:'#666'}}>
                                    Oleh: <strong>{item.reviewedBy || 'Admin'}</strong>
                                </div>
                            </div>
                        )}
                    </td>

                    <td>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button className="secondary-button" onClick={() => openMap(item)} style={{fontSize:'11px', padding:'4px 8px'}}>
                                📍 Peta
                            </button>
                            {item.photo && (
                                <button className="view-btn" onClick={() => setSelectedPhoto(item.photo!)} style={{fontSize:'11px', padding:'4px 8px', background:'#3b82f6', color:'white', border:'none', borderRadius:'4px'}}>
                                    📷 Foto
                                </button>
                            )}
                        </div>
                    </td>

                    {/* AKSI */}
                    <td>
                        {item.status === 'pending' ? (
                            <div style={{display:'flex', gap:'8px'}}>
                                <button 
                                    title="Setujui"
                                    style={{backgroundColor:'#2ecc71', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}
                                    onClick={() => handleApproval(item.id, "hadir")}
                                >
                                    ✔
                                </button>
                                <button 
                                    title="Tolak"
                                    style={{backgroundColor:'#e74c3c', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}
                                    onClick={() => handleApproval(item.id, "alpha")}
                                >
                                    ✖
                                </button>
                            </div>
                        ) : (
                            // Jika sudah diapprove, tombol approve hilang.
                            // Tampilkan tombol DELETE hanya jika Superadmin
                            userRole === 'superadmin' ? (
                                <button 
                                    onClick={() => handleSoftDelete(item.id)}
                                    style={{fontSize:'12px', color:'#ef4444', background:'none', border:'1px solid #ef4444', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}}
                                >
                                    🗑 Hapus List
                                </button>
                            ) : (
                                <span style={{fontSize:'12px', color:'#aaa'}}>Selesai</span>
                            )
                        )}
                    </td>
                </tr>
                ))
            ) : (
                <tr><td colSpan={5} style={{textAlign:'center', padding:'30px', color:'#999'}}>Tidak ada data pending/history pada tanggal ini.</td></tr>
            )}
            </tbody>
        </table>
      </div>

      {/* MODAL & STYLE SAMA SEPERTI SEBELUMNYA ... */}
      {selectedPhoto && <PhotoPreviewModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
      {showMapModal && selectedLocation && (
         /* ... Kode Modal Map sama ... */
         <div style={{position:'fixed', top:0, left:0, bottom:0, right:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={() => setShowMapModal(false)}>
            <div style={{width:'80%', height:'80%', background:'white', padding:'20px', borderRadius:'8px'}} onClick={e => e.stopPropagation()}>
                <MapLocationViewer {...selectedLocation} />
            </div>
         </div>
      )}
    </>
  );
}