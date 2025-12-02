"use client";
import React, { useState, useEffect } from "react";

type EditUserModalProps = {
  isOpen: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    position?: string;
    joinDate: string;
    areaId?: string;
  };
  onCancel: () => void;
  onSubmit: (updatedUser: any) => void;
};

export default function EditUserModal({
  isOpen,
  user,
  onCancel,
  onSubmit,
}: EditUserModalProps) {
  // Inisialisasi state
  const [formData, setFormData] = useState({
    ...user,
    areaId: user.areaId || "",
    joinDate: user.joinDate ? user.joinDate.split("T")[0] : ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);

  // Fetch Area saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetch('/api/master/area-absensi')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data && Array.isArray(data.data)) {
            setAreas(data.data);
          } else {
            setAreas([]);
          }
        })
        .catch(() => setAreas([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
        setFormData({
            ...user,
            areaId: user.areaId || "",
            joinDate: user.joinDate ? user.joinDate.split("T")[0] : ""
        });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header Modal */}
        <div className="modal-header">
            <h2 className="modal-title">Edit Data Karyawan</h2>
            <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
            {/* Grid Form dengan GAP yang lebih besar */}
            <div className="form-grid">
                <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Nama Karyawan"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="email@perusahaan.com"
                    />
                </div>

                <div className="form-group">
                    <label>Jabatan / Posisi</label>
                    <input
                        name="position"
                        value={formData.position || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Staff HR"
                    />
                </div>

                <div className="form-group">
                    <label>Tanggal Bergabung</label>
                    <input
                        name="joinDate"
                        type="date"
                        value={formData.joinDate}
                        onChange={handleChange}
                    />
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

            {/* Section Password */}
            <div className="password-section">
                <label className="section-label">Pengaturan Keamanan</label>
                <div className="form-group">
                    <label>Password</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Isi hanya jika ingin mengubah password"
                        />
                        <div className="checkbox-wrapper">
                            <input
                                id="showPass"
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPass">Lihat</label>
                        </div>
                    </div>
                    <small style={{color: '#666', fontSize: '11px'}}>*Biarkan jika tidak ingin mengubah password</small>
                    <small style={{color: '#666', fontSize: '11px'}}>*Minimal password 6 karakter</small>
                </div>
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Batal
          </button>
          <button className="btn-submit" onClick={() => onSubmit(formData)}>
            Simpan Perubahan
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-card {
          background: white;
          border-radius: 12px;
          /* DIPERLEBAR: Dari 600px jadi 750px biar lega */
          width: 750px; 
          max-width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        /* HEADER */
        .modal-header {
            padding: 15px 25px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
        }

        .modal-title {
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.8rem;
            line-height: 1;
            cursor: pointer;
            color: #94a3b8;
            transition: color 0.2s;
        }
        .close-btn:hover {
            color: #ef4444;
        }

        /* BODY */
        .modal-body {
            padding: 25px;
            overflow-y: auto;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr; /* 2 Kolom */
            /* JARAK ANTAR KOLOM & BARIS DIPERBESAR */
            column-gap: 30px; 
            row-gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px; /* Jarak Label ke Input */
        }

        .full-width {
            grid-column: span 2;
        }

        label {
            font-size: 0.9rem;
            font-weight: 600;
            color: #475569;
        }

        input, select {
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            font-size: 0.95rem;
            transition: all 0.2s;
            width: 100%; /* Pastikan input memenuhi kolom */
        }

        input:focus, select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* PASSWORD SECTION */
        .password-section {
            margin-top: 25px;
            background: #fffbeb;
            border: 1px solid #fcd34d; /* Border lebih tegas dikit */
            padding: 20px;
            border-radius: 8px;
        }

        .section-label {
            display: block;
            margin-bottom: 12px;
            color: #b45309;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-group {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .input-group input[type="text"], 
        .input-group input[type="password"] {
            flex: 1;
        }

        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            white-space: nowrap;
        }

        /* FOOTER */
        .modal-footer {
            padding: 15px 25px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: #fff;
        }

        .btn-submit {
          background: #2563eb;
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-submit:hover {
            background: #1d4ed8;
        }

        .btn-cancel {
          background: white;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-cancel:hover {
            background: #f1f5f9;
            color: #334155;
        }

        /* Responsif untuk HP (Layar Kecil) */
        @media (max-width: 640px) {
            .form-grid {
                grid-template-columns: 1fr; /* Kembali ke 1 kolom */
                row-gap: 15px;
            }
            .full-width {
                grid-column: span 1;
            }
            .modal-card {
                width: 95%;
            }
        }
      `}</style>
    </div>
  );
}