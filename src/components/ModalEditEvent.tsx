"use client";

import React, { useState } from "react";
import "@/styles/calendar.css";

interface Props {
  eventData: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditEvent({ eventData, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(eventData.title);
  const [description, setDescription] = useState(eventData.description || "");
  const [date, setDate] = useState(eventData.date.split("T")[0]); // format yyyy-mm-dd
  const [type, setType] = useState(eventData.type);

  const handleUpdate = async () => {
    try {
      await fetch(`/api/admin/event/${eventData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, type }),
      });
      onSuccess();
    } catch (err) {
      console.error("Gagal update event", err);
    }
  };

  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus event ini?")) {
      try {
        await fetch(`/api/admin/event/${eventData.id}`, { method: "DELETE" });
        onSuccess();
      } catch (err) {
        console.error("Gagal hapus event", err);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Edit Event</h2>

        <label>Judul</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Deskripsi</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Tanggal</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Jenis Event</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="BIRTHDAY">Ulang Tahun</option>
          <option value="MEETING">Meeting</option>
          <option value="HOLIDAY">Libur</option>
          <option value="OTHER">Lainnya</option>
        </select>

        <div className="modal-actions">
          <button onClick={handleUpdate} className="simpan-button">Simpan</button>
          <button onClick={onClose} className="batal-button">Batal</button>
          <button onClick={handleDelete} className="hapus-button">Hapus</button>
        </div>
      </div>
    </div>
  );
}
