"use client";
import React, { useState, useEffect } from "react";

type EditUserModalProps = {
  isOpen: boolean;
  user: any; 
  onCancel: () => void;
  onSubmit: (updatedUser: any) => void;
};

type UserFormState = {
    id?: string;
    name: string;
    email: string;
    password?: string;
    position?: string;
    positionId: string | number;
    joinDate: string;
    areaId: string | number;
    jabatan?: any;
    role?: string;
    isActive?: boolean;
    // FIELD BARU
    birthDate: string;        // Tanggal Lahir
    yearlyLeaveQuota: number; // Jatah Cuti Tahunan (Default 12)
    leaveUsedManual: number;  // Cuti Terpakai Manual
};

export default function EditUserModal({
  isOpen,
  user,
  onCancel,
  onSubmit,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UserFormState>({
    ...user,
    areaId: user.areaId || "",
    positionId: user.positionId || "",
    joinDate: user.joinDate ? user.joinDate.split("T")[0] : "",
    birthDate: user.birthDate ? user.birthDate.split("T")[0] : "", // Load tanggal lahir
    yearlyLeaveQuota: user.yearlyLeaveQuota || 12,
    leaveUsedManual: user.leaveUsedManual || 0,
    password: "" 
  });

  const [showPassword, setShowPassword] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [filteredPositions, setFilteredPositions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/master/area-absensi")
        .then((res) => res.json())
        .then((res) => setAreas(res.data || []));

      fetch("/api/master/departemen")
        .then((res) => res.json())
        .then((res) => {
          const depts = res.data || [];
          setDepartments(depts);
          if (user.positionId) {
            const foundDept = depts.find((d: any) =>
              d.positions.some((p: any) => p.id === user.positionId)
            );
            if (foundDept) {
              setSelectedDept(foundDept.id.toString());
            }
          }
        });
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        areaId: user.areaId || "",
        positionId: user.positionId || "",
        joinDate: user.joinDate ? user.joinDate.split("T")[0] : "",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "", // Load
        yearlyLeaveQuota: user.yearlyLeaveQuota || 12, // Load
        leaveUsedManual: user.leaveUsedManual || 0,   // Load
        password: "" 
      });
      setShowPassword(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedDept) {
      const dept = departments.find((d) => d.id === Number(selectedDept));
      setFilteredPositions(dept ? dept.positions : []);
    } else {
      setFilteredPositions([]);
    }
  }, [selectedDept, departments]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Handle number inputs
    if (type === 'number') {
        setFormData({ ...formData, [name]: Number(value) });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Edit Data Karyawan</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            {/* --- DATA PRIBADI --- */}
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} />
            </div>

            {/* --- JABATAN & AREA --- */}
            <div className="form-group">
              <label>Unit Bisnis</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setFormData((prev) => ({ ...prev, positionId: "" }));
                }}
              >
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
              >
                <option value="">-- Pilih Jabatan --</option>
                {filteredPositions.map((pos: any) => (
                  <option key={pos.id} value={pos.id}>{pos.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Tanggal Bergabung</label>
              <input name="joinDate" type="date" value={formData.joinDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Area Absensi</label>
              <select name="areaId" value={formData.areaId} onChange={handleChange}>
                <option value="">-- Pilih Area Absensi --</option>
                {areas.map((area: any) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            {/* --- FIELD BARU (CUTI & ULANG TAHUN) --- */}
            <div className="form-group">
                <label>Tanggal Lahir (Untuk Kalender)</label>
                <input 
                    name="birthDate" 
                    type="date" 
                    value={formData.birthDate} 
                    onChange={handleChange} 
                />
            </div>
            <div className="form-group" style={{gridColumn: 'span 2', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div>
                    <label>Jatah Cuti Tahunan</label>
                    <input 
                        name="yearlyLeaveQuota" 
                        type="number" 
                        min="0"
                        value={formData.yearlyLeaveQuota} 
                        onChange={handleChange} 
                    />
                    <small style={{color:'#666', fontSize:'11px'}}>Standar: 12 Hari</small>
                </div>
                <div>
                    <label>Cuti Terpakai Manual</label>
                    <input 
                        name="leaveUsedManual" 
                        type="number" 
                        min="0"
                        value={formData.leaveUsedManual} 
                        onChange={handleChange} 
                    />
                    <small style={{color:'#666', fontSize:'11px'}}>Potongan cuti sebelum pakai sistem ini</small>
                </div>
            </div>
          </div>

          {/* --- PASSWORD --- */}
          <div className="password-section">
            <label className="section-label">Reset Password</label>
            <div className="form-group">
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ketik password baru disini..."
                  autoComplete="new-password"
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Sembunyikan" : "Lihat"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Batal</button>
          <button className="btn-submit" onClick={() => onSubmit(formData)}>Simpan Perubahan</button>
        </div>
      </div>

      <style jsx>{`
        /* Style CSS sama seperti sebelumnya */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; alignItems: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
        .modal-card { background: white; border-radius: 12px; width: 750px; max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
        .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; }
        .modal-body { padding: 25px; overflow-y: auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 30px; row-gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        input, select { padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%; }
        .password-section { margin-top: 25px; background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; }
        .section-label { display: block; margin-bottom: 12px; color: #b45309; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        .input-group { display: flex; gap: 0; align-items: stretch; position: relative; }
        .input-group input { border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none; }
        .toggle-password {
            background: #fff; border: 1px solid #cbd5e1; border-left: none;
            border-top-right-radius: 6px; border-bottom-right-radius: 6px;
            padding: 0 15px; cursor: pointer; font-size: 1.2rem;
            display: flex; align-items: center; justify-content: center;
        }
        .toggle-password:hover { background: #f8fafc; }
        .modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; background: #fff; }
        .btn-submit { background: #2563eb; color: white; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}