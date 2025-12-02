"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";

type AddAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddAdminModal({ isOpen, onClose, onSuccess }: AddAdminModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Validasi input kosong
    if (!formData.name || !formData.email || !formData.password) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Belum Lengkap',
            text: 'Mohon isi Nama, Email, dan Password.'
        });
        return;
    }

    try {
      // 1. Loading
      Swal.fire({ 
        title: 'Menyimpan...', 
        text: 'Sedang membuat akun admin baru',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading() 
      });
      
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Cek apakah response berupa JSON valid
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respon server bukan JSON. Pastikan API route '/api/admin-users' sudah dibuat.");
      }

      if (res.ok) {
        // 2. Sukses
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Admin baru berhasil ditambahkan.',
            timer: 1500,
            showConfirmButton: false
        });
        
        setFormData({ name: "", email: "", password: "" });
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambahkan admin");
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire("Gagal", error.message || "Terjadi kesalahan sistem", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
            <h2 className="modal-title">Tambah Admin Baru</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            {/* Form Grid (Desain Konsisten) */}
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Nama Lengkap <span style={{color:'red'}}>*</span></label>
                    <input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Contoh: Administrator Utama"
                    />
                </div>

                <div className="form-group">
                    <label>Email Login <span style={{color:'red'}}>*</span></label>
                    <input 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="admin@perusahaan.com"
                    />
                </div>

                <div className="form-group">
                    <label>Password <span style={{color:'red'}}>*</span></label>
                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Kombinasi aman"
                        />
                        <div className="checkbox-wrapper">
                            <input
                                id="showPassAdmin"
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassAdmin">Lihat</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd'}}>
                <p style={{margin:0, fontSize:'0.9rem', color:'#0369a1'}}>
                    <strong>Catatan:</strong> User admin memiliki akses penuh untuk mengelola data karyawan, absensi, dan pengaturan sistem.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Batal</button>
            <button className="btn-submit" onClick={handleSubmit}>Simpan Admin</button>
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
          width: 750px; /* Lebar Ideal */
          max-width: 100%;
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
        .close-btn:hover { color: #ef4444; }

        /* BODY */
        .modal-body { padding: 25px; }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 30px;
            row-gap: 20px;
        }

        .full-width { grid-column: span 2; }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        label {
            font-size: 0.9rem;
            font-weight: 600;
            color: #475569;
        }

        input {
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            font-size: 0.95rem;
            width: 100%;
            transition: all 0.2s;
        }

        input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .input-group input { flex: 1; }

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
          background: #0f172a; /* Warna gelap untuk admin */
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-submit:hover { background: #1e293b; }

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

        .btn-cancel:hover { background: #f1f5f9; color: #334155; }

        @media (max-width: 640px) {
            .form-grid { grid-template-columns: 1fr; }
            .full-width { grid-column: span 1; }
            .modal-card { width: 95%; }
        }
      `}</style>
    </div>
  );
}