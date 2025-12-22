"use client";
import { useEffect, useState } from "react";
import PhotoPreviewModal from "@/components/PhotoPreviewModal"; // Import Modal Preview

interface LeaveRequest {
  id: string;
  type: "izin" | "sakit" | "cuti";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "disetujui" | "ditolak";
  attachment?: string | null; // Tambahkan field attachment
  createdAt: string;
  user: {
    name: string;
  };
}

export default function AdminLeaveRequestTable() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("");
  
  // State untuk Modal Preview Foto
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (jenis) params.append("jenis", jenis);
        if (status) params.append("status", status);
        const res = await fetch(`/api/admin/pengajuan?${params.toString()}`);
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Gagal mengambil data pengajuan (admin):", error);
      }
    };
    fetchData();
  }, [jenis, status]);

  const handleVerifikasi = async (id: string, status: "disetujui" | "ditolak") => {
    try {
      await fetch("/api/admin/pengajuan/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      // Ambil ulang data
      const res = await fetch("/api/admin/pengajuan");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Gagal memverifikasi:", error);
    }
  };

  // Fungsi Cerdas: Cek tipe file untuk preview
  const handleViewAttachment = (url: string) => {
    const lowerUrl = url.toLowerCase();
    // Jika PDF, buka di tab baru
    if (lowerUrl.endsWith(".pdf")) {
        window.open(url, "_blank");
    } else {
        // Jika Gambar, buka di Modal
        setPreviewPhoto(url);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="filter-row" style={{ marginBottom: "20px" }}>
        <select
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          className="filter-select"
        >
          <option value="">Semua Jenis</option>
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
          <option value="cuti">Cuti</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="table-container">
        <table className="styled-table">
            <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Tanggal</th>
                <th>Alasan</th>
                <th>Lampiran</th> {/* Kolom Baru */}
                <th>Status</th>
                <th>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {requests.length === 0 ? (
                <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "16px", color: "#6B7280" }}>
                    Belum ada pengajuan.
                </td>
                </tr>
            ) : (
                requests.map((req, index) => (
                <tr key={req.id}>
                    <td>{index + 1}</td>
                    <td>{req.user.name}</td>
                    <td>
                        <span style={{fontWeight:'bold', textTransform:'capitalize'}}>{req.type}</span>
                    </td>
                    <td>
                    {new Date(req.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(req.endDate).toLocaleDateString("id-ID")}
                    </td>
                    <td>{req.reason}</td>
                    
                    {/* KOLOM LAMPIRAN */}
                    <td style={{textAlign: 'center'}}>
                        {req.attachment ? (
                             <button
                                onClick={() => handleViewAttachment(req.attachment!)}
                                className="btn-action"
                                title="Lihat Lampiran"
                                style={{ 
                                    fontSize: '12px', 
                                    background: '#3b82f6', 
                                    color: 'white', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                📎 Lihat Bukti
                            </button>
                        ) : (
                            <span style={{color: '#9ca3af', fontSize: '12px', fontStyle:'italic'}}>
                                -
                            </span>
                        )}
                    </td>

                    <td>
                    <span className={`status-badge ${req.status}`}>
                        {req.status}
                    </span>
                    </td>
                    <td>
                    {req.status === "pending" && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            className="btn-action edit"
                            onClick={() => handleVerifikasi(req.id, "disetujui")}
                            title="Setujui"
                            style={{ fontSize: '14px', background: '#dcfce7', padding: '5px 10px', borderRadius: '4px', color: '#166534' }}
                        >
                            ✔ Terima
                        </button>
                        <button
                            className="btn-action delete"
                            onClick={() => handleVerifikasi(req.id, "ditolak")}
                            title="Tolak"
                            style={{ fontSize: '14px', background: '#fee2e2', padding: '5px 10px', borderRadius: '4px', color: '#991b1b' }}
                        >
                            ✖ Tolak
                        </button>
                        </div>
                    )}
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
      </div>

      {/* MODAL PREVIEW FOTO */}
      {previewPhoto && (
        <PhotoPreviewModal
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
        />
      )}
    </div>
  );
}