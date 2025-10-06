// src/components/TambahKaryawanModal.tsx
'use client'
import { useState, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function TambahKaryawanModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    joinDate: '',
    areaId: '',
  });

  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    // Ambil daftar area absensi saat modal dibuka
    if (isOpen) {
      fetch('/api/admin/area')
        .then((res) => res.json())
        .then((data) => {
          setAreas(Array.isArray(data) ? data : []);
        })
        .catch(() => setAreas([]));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(form);
    setForm({ name: '', email: '', password: '', position: '', joinDate: '', areaId: '' });
    onClose();
  };

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Tambah Karyawan</h2>
  <input name="name" placeholder="Nama" value={form.name} onChange={handleChange} />
  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
  <input name="password" placeholder="Password" value={form.password} onChange={handleChange} />
  <input name="position" placeholder="Posisi" value={form.position} onChange={handleChange} />
  <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} />
        <select name="areaId" value={form.areaId} onChange={handleChange}>
          <option value="">Pilih Area Absensi</option>
          {areas.map((area: any) => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button onClick={handleSubmit}>Simpan</button>
          <button onClick={onClose}>Batal</button>
        </div>
      </div>
    </div>
  )
}
