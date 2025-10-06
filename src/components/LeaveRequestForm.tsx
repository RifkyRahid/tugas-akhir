"use client";
import Swal from 'sweetalert2';
import { useState } from "react";

export default function LeaveRequestForm() {
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/pengajuan", {
      method: "POST",
      body: JSON.stringify({
        type: selectedType,
        startDate,
        endDate,
        reason,
      }),
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Pengajuan berhasil!',
        text: 'Pengajuan cuti/izin/sakit sudah dikirim dan akan diproses.',
      });
      setSelectedType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setMessage({ text: "", type: "" });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Pengajuan gagal',
        text: 'Silakan coba lagi atau hubungi admin.',
      });
      setMessage({ text: "", type: "" });
    }
  };

  const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

  return (
    <form onSubmit={handleSubmit} className="leave-form">
      <div className="form-section">
        <label className="form-label">Jenis Pengajuan</label>
        <div className="checkbox-group">
          {["cuti", "sakit", "izin"].map((type) => (
            <label key={type} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedType === type}
                onChange={() => setSelectedType(type)}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="form-label">Tanggal Mulai</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          min={today} // hanya bisa pilih hari ini atau setelahnya
        />
      </div>

      <div className="form-section">
        <label className="form-label">Tanggal Selesai</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          min={startDate || today} // tanggal selesai minimal sama dengan tanggal mulai
        />
      </div>

      <div className="form-section">
        <label className="form-label">Alasan</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tulis alasan pengajuan..."
          required
        />
      </div>

      <button type="submit" className="submit-button">
        Ajukan
      </button>

      {message.text && (
        <p
          className={`message ${
            message.type === "success" ? "success-text" : "error-text"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
