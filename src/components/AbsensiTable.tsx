"use client";
import React, { useState } from "react";
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
  const [photoModal, setPhotoModal] = useState<string | null>(null);

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
          </tr>
        </thead>
        <tbody>
          {absensi.map((a, index) => (
            <tr key={a.id}>
              <td>{index + 1}</td>
              <td>{a.user.name}</td>
              <td>{new Date(a.date).toLocaleDateString("id-ID")}</td>
              <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
              <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
              <td>{a.status}</td>
              <td>
                {a.photo ? (
                  <button className="add-button" style={{ backgroundColor: "#3b82f6" }} onClick={() => setPhotoModal(a.photo ?? null)}>
                    Lihat Foto
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
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
