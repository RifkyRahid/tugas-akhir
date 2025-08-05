"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";

interface Absensi {
  id: string;
  date: string;
  checkIn: string;
  user: { name: string };
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function ApprovalAbsensiPage() {
  const [data, setData] = useState<Absensi[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/absensi/pending");
    const result = await res.json();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproval = async (id: string, status: string) => {
    await fetch("/api/absensi/approval", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  return (
    <AdminLayout>
      <h1 className="page-title">Approval Absensi</h1>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Foto</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.user.name}</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{new Date(item.checkIn).toLocaleTimeString()}</td>
              <td>
                {item.photo ? (
                  <button className="add-button" onClick={() => setSelectedPhoto(item.photo!)}>Lihat Foto</button>
                ) : "-"}
              </td>
              <td>
                <button className="add-button" onClick={() => handleApproval(item.id, "hadir")}>Setujui</button>{" "}
                <button className="delete-button" onClick={() => handleApproval(item.id, "alpha")}>Tolak</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPhoto && (
        <PhotoPreviewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </AdminLayout>
  );
}
