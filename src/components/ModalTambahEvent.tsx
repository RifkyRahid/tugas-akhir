"use client";

import React, { useState } from "react";
import "@/styles/calendar.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalTambahEvent({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("OTHER");

  const handleSubmit = async () => {
    try {
      await fetch("/api/admin/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, type }),
      });
      onSuccess();
    } catch (err) {
      console.error("Gagal tambah event", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ padding: "25px 30px", borderLeft: "5px solid #FFD700", borderRadius: "10px" }}>
        <h2 style={{ color: "#007bff", marginBottom: "20px" }}>Tambah Event</h2>

        <div className="form-group">
          <label>Judul</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Deskripsi</label>
          <textarea
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Tanggal</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Jenis Event</label>
          <select
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="MEETING">Meeting</option>
            <option value="BIRTHDAY">Ulang Tahun</option>
            <option value="HOLIDAY">Libur</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={handleSubmit} className="simpan-button">Simpan</button>
          <button onClick={onClose} className="batal-button">Batal</button>
        </div>
      </div>
    </div>
  );
}

