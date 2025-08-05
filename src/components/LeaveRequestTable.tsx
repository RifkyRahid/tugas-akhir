"use client";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";

interface LeaveRequest {
  id: string;
  type: "izin" | "sakit" | "cuti";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "disetujui" | "ditolak";
  createdAt: string;
}

export default function LeaveRequestTable() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/pengajuan", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Gagal mengambil data pengajuan:", err);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="leave-container">
      <h2 className="leave-title">Riwayat Pengajuan</h2>
      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th>Alasan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data">Belum ada pengajuan.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="capitalize">{req.type}</td>
                  <td>
                    {new Date(req.startDate).toLocaleDateString()} -{" "}
                    {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td>{req.reason}</td>
                  <td>
                    <span className={`status-badge ${req.status}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
