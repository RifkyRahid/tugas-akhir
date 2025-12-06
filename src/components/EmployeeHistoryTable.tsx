"use client";
import { useEffect, useState } from "react";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";

interface RequestItem {
  id: string;
  type?: string;        // Cuti
  startDate?: string;   // Cuti
  endDate?: string;     // Cuti
  date?: string;        // Koreksi
  jamPulang?: string;   // Koreksi
  reason: string;
  status: "pending" | "disetujui" | "ditolak";
  attachment?: string | null;
  createdAt: string;
}

export default function EmployeeHistoryTable({ refreshTrigger }: { refreshTrigger: number }) {
  const [activeTab, setActiveTab] = useState<"leave" | "correction">("leave");
  const [data, setData] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Tentukan endpoint berdasarkan tab
      const endpoint = activeTab === "leave" ? "/api/pengajuan" : "/api/pengajuan/koreksi";
      const res = await fetch(endpoint);
      const result = await res.json();
      
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Gagal load history", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ulang saat tab berubah atau saat form di-submit (refreshTrigger berubah)
  useEffect(() => {
    fetchData();
  }, [activeTab, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disetujui": return <span className="badge green">Disetujui</span>;
      case "ditolak": return <span className="badge red">Ditolak</span>;
      default: return <span className="badge yellow">Menunggu</span>;
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
        Riwayat Pengajuan Saya
      </h3>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={() => setActiveTab("leave")}
          className={`tab-btn ${activeTab === "leave" ? "active" : ""}`}
        >
          Izin & Cuti
        </button>
        <button
          onClick={() => setActiveTab("correction")}
          className={`tab-btn ${activeTab === "correction" ? "active" : ""}`}
        >
          Koreksi Absen
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="styled-table">
          <thead>
            <tr>
              <th>No</th>
              {activeTab === 'leave' ? (
                  <><th>Jenis</th><th>Tanggal</th></>
              ) : (
                  <><th>Tgl Absen</th><th>Jam Pulang (Revisi)</th></>
              )}
              <th>Alasan</th>
              <th>Status</th>
              <th>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>Memuat data...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>Belum ada riwayat.</td></tr>
            ) : (
                data.map((item, idx) => (
                    <tr key={item.id}>
                        <td>{idx + 1}</td>
                        
                        {activeTab === 'leave' ? (
                            <>
                                <td>
                                    <span style={{textTransform:'capitalize', fontWeight:'bold', fontSize:'13px'}}>
                                        {item.type}
                                    </span>
                                </td>
                                <td>
                                    {new Date(item.startDate!).toLocaleDateString('id-ID')} s/d <br/>
                                    {new Date(item.endDate!).toLocaleDateString('id-ID')}
                                </td>
                            </>
                        ) : (
                            <>
                                <td>{new Date(item.date!).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <strong>{new Date(item.jamPulang!).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</strong>
                                </td>
                            </>
                        )}

                        <td style={{maxWidth:'200px'}}>{item.reason}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                            {item.attachment ? (
                                <button 
                                    onClick={() => setPhotoModal(item.attachment!)}
                                    style={{fontSize:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}
                                >
                                    Lihat
                                </button>
                            ) : "-"}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {photoModal && (
        <PhotoPreviewModal photo={photoModal} onClose={() => setPhotoModal(null)} />
      )}

      <style jsx>{`
        .tab-btn {
            padding: 8px 16px;
            border: 1px solid #ccc;
            border-radius: 20px;
            background: #fff;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            color: #666;
            transition: all 0.2s;
        }
        .tab-btn.active {
            background: #0f172a;
            color: white;
            border-color: #0f172a;
        }
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; }
        .badge.green { background-color: #22c55e; }
        .badge.red { background-color: #ef4444; }
        .badge.yellow { background-color: #f59e0b; }
      `}</style>
    </div>
  );
}