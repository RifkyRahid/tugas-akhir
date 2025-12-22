"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Props {
  initialDate?: string; // Prop baru
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalTambahEvent({ initialDate, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate || ""); // Default ke tanggal yg diklik
  const [type, setType] = useState("MEETING");

  // Jika initialDate berubah (misal user tutup lalu klik tanggal lain), update state
  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  const handleSubmit = async () => {
    if(!title || !date) {
        Swal.fire("Gagal", "Judul dan Tanggal wajib diisi", "warning");
        return;
    }

    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });

      const res = await fetch("/api/admin/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, type }),
      });

      if(res.ok) {
          await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Event ditambahkan', timer: 1500, showConfirmButton: false });
          onSuccess();
      } else {
          throw new Error("Gagal");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menambahkan event", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
            <h2 className="modal-title">Tambah Event Baru</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            <div className="form-group">
                <label>Judul Kegiatan</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Rapat Bulanan" autoFocus />
            </div>

            <div className="form-group">
                <label>Tanggal</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Kategori</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="MEETING">Meeting</option>
                    <option value="HOLIDAY">Hari Libur</option>
                    <option value="BIRTHDAY">Ulang Tahun (Manual)</option>
                    <option value="OTHER">Lainnya</option>
                </select>
            </div>

            <div className="form-group">
                <label>Deskripsi (Opsional)</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Tambahkan detail kegiatan..."
                    style={{minHeight: '80px'}}
                />
            </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-submit">Simpan Event</button>
        </div>
      </div>

      {/* Gunakan Style yang sama dengan Modal User agar konsisten */}
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
        .modal-card { background: white; border-radius: 12px; width: 500px; max-width: 100%; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
        .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; }
        .modal-body { padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        input, select, textarea { padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%; font-family: inherit; }
        .modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; background: #fff; }
        .btn-submit { background: #3b82f6; color: white; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
}