"use client";
import { useEffect, useState } from "react";

interface LeaveRequest {
  id: string;
  type: "izin" | "sakit" | "cuti";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "disetujui" | "ditolak";
  createdAt: string;
  user: {
    name: string;
  };
}

export default function AdminLeaveRequestTable() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("");

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
      // Ambil ulang data setelah verifikasi
      const res = await fetch("/api/admin/pengajuan");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Gagal memverifikasi:", error);
    }
  };

  return (
    <div className="dashboard-card">
      <form className="filter-bar" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <select
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          style={dropdownStyle}
        >
          <option value="">Semua Jenis</option>
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
          <option value="cuti">Cuti</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={dropdownStyle}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </form>

      <table className="styled-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Jenis</th>
            <th>Tanggal</th>
            <th>Alasan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "16px", color: "#6B7280" }}>
                Belum ada pengajuan.
              </td>
            </tr>
          ) : (
            requests.map((req, index) => (
              <tr key={req.id}>
                <td>{index + 1}</td>
                <td>{req.user.name}</td>
                <td>{req.type}</td>
                <td>
                  {new Date(req.startDate).toLocaleDateString()} -{" "}
                  {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td>{req.reason}</td>
                <td>
                  <span
                    style={{
                      ...statusStyle,
                      backgroundColor: getStatusColor(req.status),
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="action-button approve"
                        onClick={() => handleVerifikasi(req.id, "disetujui")}
                      >
                        Setujui
                      </button>
                      <button
                        className="action-button reject"
                        onClick={() => handleVerifikasi(req.id, "ditolak")}
                      >
                        Tolak
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
  );
}

const dropdownStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const statusStyle = {
  padding: "4px 8px",
  borderRadius: "12px",
  color: "white",
  fontSize: "12px",
  textTransform: "capitalize" as const,
};

function getStatusColor(status: string) {
  if (status === "pending") return "#FACC15";
  if (status === "disetujui") return "#22C55E";
  return "#EF4444";
}
