"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: any) => void;
};

export default function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    joinDate: "",
    areaId: "",
    positionId: "",
    // FIELD BARU
    birthDate: "",
    yearlyLeaveQuota: 12, // Default 12
    leaveUsedManual: 0,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  
  // State untuk Dropdown Bertingkat
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [filteredPositions, setFilteredPositions] = useState<any[]>([]);

  // 1. Fetch Data Master (Area & Departemen)
  useEffect(() => {
    if (isOpen) {
      fetch('/api/master/area-absensi')
        .then((res) => res.json())
        .then((res) => setAreas(res.data || []));

      fetch('/api/master/departemen')
        .then((res) => res.json())
        .then((res) => setDepartments(res.data || []));
    }
  }, [isOpen]);

  // 2. Logic Filter Jabatan
  useEffect(() => {
    if (selectedDept) {
      const dept = departments.find(d => d.id === Number(selectedDept));
      setFilteredPositions(dept ? dept.positions : []);
    } else {
      setFilteredPositions([]);
    }
    setFormData(prev => ({ ...prev, positionId: "" }));
  }, [selectedDept, departments]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
        setFormData({ ...formData, [name]: Number(value) });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
        Swal.fire("Peringatan", "Nama, Email, dan Password wajib diisi.", "warning");
        return;
    }

    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });

      const res = await fetch("/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newUser = await res.json();
        
        await Swal.fire({
            icon: 'success', title: 'Berhasil!', text: 'Karyawan ditambahkan.', timer: 1500, showConfirmButton: false
        });

        onUserAdded(newUser);
        
        // Reset Form
        setFormData({ 
            name: "", email: "", password: "", joinDate: "", areaId: "", positionId: "",
            birthDate: "", yearlyLeaveQuota: 12, leaveUsedManual: 0
        });
        setSelectedDept("");
        onClose();
      } else {
        throw new Error("Gagal response");
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan.' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
            <h2 className="modal-title">Tambah Karyawan Baru</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            <div className="form-grid">
                {/* Kolom Kiri */}
                <div className="form-group">
                    <label>Nama Lengkap <span style={{color:'red'}}>*</span></label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nama Karyawan" />
                </div>

                <div className="form-group">
                    <label>Email <span style={{color:'red'}}>*</span></label>
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="email@perusahaan.com" />
                </div>

                <div className="form-group">
                    <label>Password <span style={{color:'red'}}>*</span></label>
                    <div className="input-group">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password Login" />
                        <div className="checkbox-wrapper">
                            <input id="showPassAdd" type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                            <label htmlFor="showPassAdd">Lihat</label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Tanggal Bergabung</label>
                    <input name="joinDate" type="date" value={formData.joinDate} onChange={handleChange} />
                </div>

                {/* --- DATA CUTI & LAHIR (BARU) --- */}
                <div className="form-group">
                    <label>Tanggal Lahir</label>
                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                </div>

                <div className="form-group" style={{gridColumn: 'span 2', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <label>Jatah Cuti Tahunan</label>
                        <input name="yearlyLeaveQuota" type="number" min="0" value={formData.yearlyLeaveQuota} onChange={handleChange} />
                        <small style={{color:'#666', fontSize:'11px'}}>Default: 12 Hari</small>
                    </div>
                    <div>
                        <label>Saldo Terpakai Manual</label>
                        <input name="leaveUsedManual" type="number" min="0" value={formData.leaveUsedManual} onChange={handleChange} />
                        <small style={{color:'#666', fontSize:'11px'}}>Jika ada pemakaian sebelum sistem ini</small>
                    </div>
                </div>

                {/* --- JABATAN & AREA --- */}
                <div className="form-group">
                    <label>Unit Bisnis</label>
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ background: '#f8fafc' }}>
                        <option value="">-- Pilih Unit --</option>
                        {departments.map((dept: any) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Jabatan / Posisi</label>
                    <select 
                        name="positionId" 
                        value={formData.positionId} 
                        onChange={handleChange}
                        disabled={!selectedDept} 
                        style={{ background: !selectedDept ? '#e2e8f0' : 'white' }}
                    >
                        <option value="">-- Pilih Jabatan --</option>
                        {filteredPositions.map((pos: any) => (
                            <option key={pos.id} value={pos.id}>{pos.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group full-width">
                    <label>Area Absensi</label>
                    <select name="areaId" value={formData.areaId} onChange={handleChange}>
                        <option value="">-- Pilih Area Absensi --</option>
                        {areas.map((area: any) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-submit" onClick={handleSubmit}>Simpan Data</button>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
        .modal-card { background: white; border-radius: 12px; width: 750px; max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
        .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; }
        .modal-body { padding: 25px; overflow-y: auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 30px; row-gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .full-width { grid-column: span 2; }
        label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        input, select { padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%; }
        .input-group { display: flex; gap: 12px; align-items: center; }
        .checkbox-wrapper { display: flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 0.9rem; }
        .modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; background: #fff; }
        .btn-submit { background: #2563eb; color: white; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
      `}</style>
    </div>
  );
}