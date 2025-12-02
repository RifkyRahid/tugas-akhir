"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

type EditAdminModalProps = {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditAdminModal({ isOpen, user, onClose, onSuccess }: EditAdminModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Reset form saat user berubah
  useEffect(() => {
    if (user) {
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: "" // Password dikosongkan (mode edit/reset)
        });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });
      
      // Filter payload: Jangan kirim password jika kosong
      const payload: any = { 
          name: formData.name, 
          email: formData.email 
      };
      if (formData.password.trim() !== "") {
          payload.password = formData.password;
      }

      const res = await fetch(`/api/admin-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data admin diperbarui.',
            timer: 1500,
            showConfirmButton: false
        });
        onSuccess();
        onClose();
      } else {
        throw new Error("Gagal update");
      }
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
            <h2 className="modal-title">Edit Data Admin</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            {/* Grid Form */}
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Nama Lengkap</label>
                    <input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nama Admin"
                    />
                </div>

                <div className="form-group full-width">
                    <label>Email Login</label>
                    <input 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="admin@perusahaan.com"
                    />
                </div>
            </div>

            {/* Password Section (Terpisah) */}
            <div className="password-section">
                <label className="section-label">Reset Password</label>
                <div className="form-group">
                    <label>Password Baru</label>
                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Isi HANYA jika ingin mengganti password"
                        />
                        <div className="checkbox-wrapper">
                            <input
                                id="showPassEdit"
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassEdit">Lihat</label>
                        </div>
                    </div>
                    <small style={{color:'#666', marginTop:'5px'}}>*Kosongkan jika tidak ingin mengubah password saat ini.</small>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Batal</button>
            <button className="btn-submit" onClick={handleSubmit}>Simpan Perubahan</button>
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
        .modal-body { padding: 25px; overflow-y: auto; }

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

        /* Password Section Style */
        .password-section {
            margin-top: 25px;
            background: #fffbeb; /* Kuning muda */
            border: 1px solid #fcd34d;
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
          background: #0f172a;
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