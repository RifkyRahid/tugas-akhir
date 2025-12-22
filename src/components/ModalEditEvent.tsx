"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";

interface Props {
  eventData: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditEvent({ eventData, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(eventData.title);
  const [description, setDescription] = useState(eventData.description || "");
  const [date, setDate] = useState(eventData.date.split("T")[0]); 
  const [type, setType] = useState(eventData.type);

  const handleUpdate = async () => {
    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });
      
      const res = await fetch(`/api/admin/event/${eventData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, type }),
      });

      if(res.ok) {
          await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1000, showConfirmButton: false });
          onSuccess();
      }
    } catch (err) {
      Swal.fire("Error", "Gagal update event", "error");
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
        title: 'Hapus Event?',
        text: "Event ini akan dihapus permanen.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin/event/${eventData.id}`, { method: "DELETE" });
        await Swal.fire("Terhapus!", "Event telah dihapus.", "success");
        onSuccess();
      } catch (err) {
        Swal.fire("Error", "Gagal hapus event", "error");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
            <h2 className="modal-title">Edit Event</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            <div className="form-group">
                <label>Judul</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
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
                <label>Deskripsi</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    style={{minHeight: '80px'}} 
                />
            </div>
        </div>

        <div className="modal-footer" style={{justifyContent: 'space-between'}}>
          <button onClick={handleDelete} className="btn-delete">Hapus Event</button>
          <div style={{display:'flex', gap:'10px'}}>
             <button onClick={onClose} className="btn-cancel">Batal</button>
             <button onClick={handleUpdate} className="btn-submit">Simpan</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Copy style dari ModalTambahEvent, tambah btn-delete */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
        .modal-card { background: white; border-radius: 12px; width: 500px; max-width: 100%; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
        .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; }
        .modal-body { padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        input, select, textarea { padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%; font-family: inherit; }
        .modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; gap: 12px; background: #fff; }
        .btn-submit { background: #3b82f6; color: white; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .btn-delete { background: #fee2e2; color: #b91c1c; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-delete:hover { background: #fecaca; }
      `}</style>
    </div>
  );
}