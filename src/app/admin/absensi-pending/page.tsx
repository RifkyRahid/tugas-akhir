"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/AdminLayout";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";
import DateRoller from "@/components/DateRoller"; // Pastikan komponen ini sudah dibuat
import Swal from "sweetalert2";

// Import CSS Leaflet
import "leaflet/dist/leaflet.css";

// Komponen Peta Dinamis (Wajib untuk Next.js + Leaflet)
const MapLocationViewer = dynamic(
  () => import("@/components/MapLocationViewer"), 
  { ssr: false, loading: () => <p>Memuat Peta...</p> }
);

interface Absensi {
  id: string;
  date: string;
  checkIn: string;
  keterangan: string | null;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
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
  
  // --- INISIALISASI TANGGAL (FIX TIMEZONE) ---
  // Menggunakan konstruktor Date lokal untuk menghindari pergeseran ke UTC
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`; 

  const [filterDate, setFilterDate] = useState<string>(localDateString);

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    userLat: number; userLng: number;
    areaLat: number; areaLng: number;
    areaName: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterDate]); // Fetch ulang saat tanggal di DateRoller berubah

  const fetchData = async () => {
    setIsLoading(true); 
    try {
        const res = await fetch(`/api/absensi/pending?date=${filterDate}`);
        const result = await res.json();
        
        // Validasi agar selalu array
        if(Array.isArray(result)) {
            setData(result);
        } else {
            setData([]);
        }
    } catch (err) {
        console.error("Gagal ambil data", err);
        Swal.fire("Error", "Gagal mengambil data absensi pending", "error");
        setData([]);
    } finally {
        setIsLoading(false); 
    }
  };

  const handleApproval = async (id: string, status: string) => {
    const isApprove = status === 'hadir';
    
    // 1. Konfirmasi Awal
    const confirmResult = await Swal.fire({
        title: isApprove ? 'Setujui Absensi?' : 'Tolak Absensi?',
        text: isApprove 
            ? "Karyawan akan dianggap hadir." 
            : "Absensi akan ditolak (dianggap alpha/tidak hadir).",
        icon: isApprove ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonColor: isApprove ? '#3085d6' : '#d33',
        confirmButtonText: isApprove ? 'Ya, Setujui!' : 'Ya, Tolak!',
        cancelButtonText: 'Batal'
    });

    if (confirmResult.isConfirmed) {
        // 2. Loading State
        Swal.fire({
            title: 'Memproses...',
            html: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await fetch("/api/absensi/approval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (res.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: `Data berhasil ${isApprove ? 'disetujui' : 'ditolak'}.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchData(); // Refresh data tabel
            } else {
                throw new Error("Gagal update status");
            }
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat memproses data.', 'error');
        }
    }
  };

  const openMap = (item: Absensi) => {
      if (item.latitude && item.longitude && item.user.area) {
          setSelectedLocation({
              userLat: item.latitude,
              userLng: item.longitude,
              areaLat: item.user.area.latitude,
              areaLng: item.user.area.longitude,
              areaName: item.user.area.name,
              userName: item.user.name
          });
          setShowMapModal(true);
      } else {
          Swal.fire({
              icon: 'info',
              title: 'Data Lokasi Tidak Lengkap',
              text: 'Karyawan ini mungkin tidak memiliki data koordinat atau area absensi belum disetting.'
          });
      }
  }

  // Helper untuk menampilkan tanggal yang human-readable dari string YYYY-MM-DD
  // Tanpa terkena shift timezone (parse manual)
  const formatDisplayDate = (dateString: string) => {
      if(!dateString) return "-";
      const [y, m, d] = dateString.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d); // Bulan di JS mulai dari 0
      return dateObj.toLocaleDateString('id-ID', { dateStyle: 'full' });
  };

  return (
    <AdminLayout>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <div>
            <h1 className="page-title" style={{margin:0}}>Approval Absensi</h1>
            <p style={{margin:'5px 0 0', color:'#666', fontSize:'14px'}}>
                Kelola absensi yang membutuhkan persetujuan (Pending).
            </p>
        </div>
        
        {/* Date Roller Component */}
        <div className="filter-date">
            <DateRoller 
                selectedDate={filterDate} 
                onDateChange={(newDate) => setFilterDate(newDate)} 
            />
        </div>
      </div>

      <div className="table-responsive">
        <table className="styled-table">
            <thead>
            <tr>
                <th>Nama Karyawan</th>
                <th>Waktu & Alasan</th>
                <th>Lokasi</th>
                <th>Foto</th>
                <th>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {isLoading ? (
                <tr>
                    <td colSpan={5} style={{textAlign:'center', padding:'30px'}}>
                         <div style={{display:'inline-block', width:'20px', height:'20px', border:'3px solid #ccc', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 1s linear infinite', marginRight:'10px', verticalAlign:'middle'}}></div>
                        Sedang memuat data...
                    </td>
                </tr>
            ) : data.length > 0 ? (
                data.map((item) => (
                <tr key={item.id}>
                    <td>
                        <strong>{item.user.name}</strong><br/>
                        <span style={{fontSize:'12px', color:'#666'}}>
                            {item.user.area?.name || "Area Tidak Diketahui"}
                        </span>
                    </td>
                    <td>
                        {new Date(item.checkIn).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                        <br/>
                        <span style={{color: '#d9534f', fontStyle:'italic', fontSize:'13px', display:'block', marginTop:'4px'}}>
                            "{item.keterangan || 'Tidak ada catatan'}"
                        </span>
                    </td>
                    <td>
                        <button 
                            className="secondary-button"
                            onClick={() => openMap(item)}
                            style={{fontSize:'12px', padding:'5px 10px', cursor:'pointer', border:'1px solid #aaa', background:'#f9f9f9', borderRadius:'4px'}}
                        >
                            📍 Cek Peta
                        </button>
                    </td>
                    <td>
                    {item.photo ? (
                        <button 
                            className="view-btn" 
                            onClick={() => setSelectedPhoto(item.photo!)}
                            style={{fontSize:'12px', padding:'5px 10px', background:'#3498db', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                        >
                             📷 Lihat
                        </button>
                    ) : "-"}
                    </td>
                    <td>
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
                            onClick={() => handleApproval(item.id, "ditolak")}
                        >
                            ✖
                        </button>
                    </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} style={{textAlign:'center', padding:'40px', color:'#888'}}>
                        <div style={{fontSize:'16px', fontWeight:'bold', marginBottom:'5px'}}>Tidak ada data pending</div>
                        <div style={{fontSize:'13px'}}>
                            Pada tanggal {formatDisplayDate(filterDate)}
                        </div>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>

      {/* Modal Preview Foto */}
      {selectedPhoto && (
        <PhotoPreviewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Modal Peta Custom */}
      {showMapModal && selectedLocation && (
          <div style={{
              position:'fixed', top:0, left:0, right:0, bottom:0,
              backgroundColor:'rgba(0,0,0,0.6)', zIndex:9999,
              display:'flex', justifyContent:'center', alignItems:'center'
          }}>
              <div style={{
                  backgroundColor:'white', padding:'20px', borderRadius:'10px', 
                  width:'90%', maxWidth:'800px', height:'550px', 
                  display:'flex', flexDirection:'column', boxShadow:'0 5px 15px rgba(0,0,0,0.3)'
              }}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                      <h3 style={{margin:0}}>Lokasi: {selectedLocation.userName}</h3>
                      <button 
                        onClick={() => setShowMapModal(false)} 
                        style={{cursor:'pointer', border:'none', background:'none', fontSize:'24px', lineHeight:'1', color:'#888'}}
                      >✖</button>
                  </div>
                  
                  <div style={{flex:1, border:'1px solid #ddd', borderRadius:'4px', overflow:'hidden'}}>
                      <MapLocationViewer 
                        userLat={selectedLocation.userLat}
                        userLng={selectedLocation.userLng}
                        areaLat={selectedLocation.areaLat}
                        areaLng={selectedLocation.areaLng}
                        areaName={selectedLocation.areaName}
                        userName={selectedLocation.userName}
                      />
                  </div>
                  <div style={{marginTop:'10px', fontSize:'12px', color:'#666', textAlign:'center'}}>
                      Garis merah putus-putus menunjukkan jarak antara lokasi absen (merah) dengan pusat kantor (biru).
                  </div>
              </div>
          </div>
      )}
      
      {/* Style Animation untuk Spinner Loading */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}