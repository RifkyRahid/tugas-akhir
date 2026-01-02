"use client";
import { useEffect, useState } from "react";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";
import Swal from "sweetalert2";

interface LeaveRequest {
  id: string;
  type: "izin" | "sakit" | "cuti";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "disetujui" | "ditolak";
  attachment?: string | null;
  createdAt: string;
  user: {
    name: string;
    jabatan?: { title: string };
  };
}

export default function AdminLeaveRequestTable() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // --- FILTER STATE ---
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Default Tahun Ini
  const [month, setMonth] = useState(""); // Default Semua Bulan

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // --- MODAL STATE ---
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (jenis) params.append("jenis", jenis);
      if (status) params.append("status", status);
      if (year) params.append("year", year);
      if (month) params.append("month", month);
      
      // Kirim parameter page & limit
      params.append("page", page.toString());
      params.append("limit", "10"); 

      const res = await fetch(`/api/admin/pengajuan?${params.toString()}`);
      const json = await res.json();

      if (json.data) {
        setRequests(json.data);
        setTotalPages(json.meta.totalPages);
        setTotalData(json.meta.totalData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efek Refresh saat filter berubah
  useEffect(() => {
    setPage(1); // Reset ke halaman 1 jika filter berubah
  }, [jenis, status, year, month]);

  // Efek Fetch data saat page/filter berubah
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, jenis, status, year, month]);

  // Handler Verifikasi (Terima/Tolak)
  const handleVerifikasi = async (id: string, newStatus: "disetujui" | "ditolak") => {
    // Konfirmasi SweetAlert
    const result = await Swal.fire({
      title: newStatus === "disetujui" ? "Terima Pengajuan?" : "Tolak Pengajuan?",
      text: "Pastikan data sudah benar.",
      icon: newStatus === "disetujui" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "disetujui" ? "#10b981" : "#d33",
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
      await fetch("/api/admin/pengajuan/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      Swal.fire("Sukses", `Pengajuan berhasil ${newStatus}`, "success");
      fetchData(); // Refresh data
    } catch (error) {
      Swal.fire("Error", "Gagal memproses data", "error");
    }
  };

  // Helper: List Tahun (2024 s/d 5 tahun ke depan)
  const yearsList = Array.from({ length: 10 }, (_, i) => 2024 + i);
  
  // Helper: List Bulan
  const monthsList = [
    { val: "1", label: "Januari" }, { val: "2", label: "Februari" },
    { val: "3", label: "Maret" }, { val: "4", label: "April" },
    { val: "5", label: "Mei" }, { val: "6", label: "Juni" },
    { val: "7", label: "Juli" }, { val: "8", label: "Agustus" },
    { val: "9", label: "September" }, { val: "10", label: "Oktober" },
    { val: "11", label: "November" }, { val: "12", label: "Desember" },
  ];

  const handleViewAttachment = (url: string) => {
    if (url.toLowerCase().endsWith(".pdf")) {
        window.open(url, "_blank");
    } else {
        setPreviewPhoto(url);
    }
  };

  return (
    <div className="dashboard-card" style={{borderTop: '4px solid #3b82f6'}}>
      
      {/* --- AREA FILTER --- */}
      <div style={{ 
          background: '#f8fafc', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
      }}>
        {/* Filter Tahun */}
        <div>
            <label style={{fontSize:'12px', fontWeight:'bold', color:'#64748b'}}>Tahun</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="filter-select w-full">
                {yearsList.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>

        {/* Filter Bulan */}
        <div>
            <label style={{fontSize:'12px', fontWeight:'bold', color:'#64748b'}}>Bulan</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="filter-select w-full">
                <option value="">-- Semua Bulan --</option>
                {monthsList.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
        </div>

        {/* Filter Jenis */}
        <div>
            <label style={{fontSize:'12px', fontWeight:'bold', color:'#64748b'}}>Jenis Cuti</label>
            <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="filter-select w-full">
                <option value="">-- Semua --</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="cuti">Cuti</option>
            </select>
        </div>

        {/* Filter Status */}
        <div>
            <label style={{fontSize:'12px', fontWeight:'bold', color:'#64748b'}}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select w-full">
                <option value="">-- Semua --</option>
                <option value="pending">Pending</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
            </select>
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="table-container">
        <table className="styled-table">
            <thead>
            <tr style={{background:'#f1f5f9'}}>
                <th style={{width:'50px'}}>No</th>
                <th>Karyawan</th>
                <th>Tipe</th>
                <th>Periode Izin</th>
                <th>Alasan</th>
                <th style={{textAlign:'center'}}>Lampiran</th>
                <th style={{textAlign:'center'}}>Status</th>
                <th style={{textAlign:'center'}}>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                 <tr><td colSpan={8} style={{textAlign:'center', padding:'20px'}}>Memuat data...</td></tr>
            ) : requests.length === 0 ? (
                <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                    <div style={{fontSize:'30px', marginBottom:'10px'}}>📭</div>
                    Tidak ada data pengajuan yang sesuai filter.
                </td>
                </tr>
            ) : (
                requests.map((req, index) => (
                <tr key={req.id}>
                    <td>{(page - 1) * 10 + index + 1}</td>
                    <td>
                        <div style={{fontWeight:'bold'}}>{req.user.name}</div>
                        <div style={{fontSize:'11px', color:'#64748b'}}>{req.user.jabatan?.title || '-'}</div>
                    </td>
                    <td>
                        <span style={{
                            textTransform:'uppercase', 
                            fontSize:'11px', 
                            fontWeight:'bold',
                            padding:'2px 6px', 
                            borderRadius:'4px',
                            background: req.type === 'sakit' ? '#fee2e2' : req.type === 'cuti' ? '#dbeafe' : '#f3f4f6',
                            color: req.type === 'sakit' ? '#991b1b' : req.type === 'cuti' ? '#1e40af' : '#374151',
                        }}>
                            {req.type}
                        </span>
                    </td>
                    <td style={{fontSize:'13px'}}>
                        {new Date(req.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} 
                        {' - '} 
                        {new Date(req.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{maxWidth:'200px', fontSize:'13px'}}>{req.reason}</td>
                    
                    <td style={{textAlign: 'center'}}>
                        {req.attachment ? (
                             <button onClick={() => handleViewAttachment(req.attachment!)} className="btn-action" style={{ fontSize: '11px', background: 'white', color: '#2563eb', border: '1px solid #2563eb' }}>
                                📄 Lihat
                            </button>
                        ) : <span style={{color:'#ccc'}}>-</span>}
                    </td>

                    <td style={{textAlign:'center'}}>
                         <span className={`status-badge ${req.status}`} style={{padding:'4px 10px', fontSize:'11px'}}>
                            {req.status}
                        </span>
                    </td>
                    
                    <td style={{textAlign:'center'}}>
                    {req.status === "pending" ? (
                        <div style={{ display: "flex", gap: "5px", justifyContent:'center' }}>
                            <button
                                onClick={() => handleVerifikasi(req.id, "disetujui")}
                                title="Terima"
                                style={{ border:'none', background: '#dcfce7', width:'30px', height:'30px', borderRadius: '6px', color: '#166534', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                            >
                                ✔
                            </button>
                            <button
                                onClick={() => handleVerifikasi(req.id, "ditolak")}
                                title="Tolak"
                                style={{ border:'none', background: '#fee2e2', width:'30px', height:'30px', borderRadius: '6px', color: '#991b1b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                            >
                                ✖
                            </button>
                        </div>
                    ) : (
                        <span style={{color:'#9ca3af', fontSize:'11px'}}>Selesai</span>
                    )}
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROL --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{fontSize:'13px', color:'#64748b'}}>
              Total Data: <b>{totalData}</b>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button 
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={page === 1}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: page===1 ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: page===1?'not-allowed':'pointer' }}
              >
                Prev
              </button>
              
              <span style={{ fontSize: '13px', fontWeight: 'bold', padding: '0 10px' }}>
                  Halaman {page} / {totalPages}
              </span>

              <button 
                onClick={() => setPage(old => Math.min(old + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: page===totalPages?'#f1f5f9':'white', borderRadius: '6px', cursor: page===totalPages?'not-allowed':'pointer' }}
              >
                Next
              </button>
          </div>
      </div>

      {/* MODAL PREVIEW */}
      {previewPhoto && (
        <PhotoPreviewModal
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
        />
      )}
    </div>
  );
}