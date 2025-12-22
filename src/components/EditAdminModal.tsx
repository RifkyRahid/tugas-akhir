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

  useEffect(() => {
    if (user) {
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: "" 
        });
        setShowPassword(false);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });
      
      const payload: any = { name: formData.name, email: formData.email };
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
        <div className="modal-header">
            <h2 className="modal-title">Edit Data Admin</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Nama Lengkap</label>
                    <input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="form-group full-width">
                    <label>Email Login</label>
                    <input 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            <div className="password-section">
                <label className="section-label">Reset Password</label>
                <div className="form-group">
                    <label>Password Baru</label>
                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                    <small style={{color:'#d97706', fontSize:'12px', marginTop:'5px'}}>
                        *Isi kolom ini HANYA jika ingin mengubah password admin ini. Password lama tidak dapat ditampilkan karena terenkripsi.
                    </small>
                </div>
            </div>
        </div>

        <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Batal</button>
            <button className="btn-submit" onClick={handleSubmit}>Simpan Perubahan</button>
        </div>
      </div>

      <style jsx>{`
        /* ... CSS SAMA DENGAN EditUserModal di atas ... */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 12px; width: 750px; max-width: 100%; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
        .modal-title { color: #1e293b; font-size: 1.25rem; font-weight: 700; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; line-height: 1; cursor: pointer; color: #94a3b8; transition: color 0.2s; }
        .close-btn:hover { color: #ef4444; }
        .modal-body { padding: 25px; overflow-y: auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 30px; row-gap: 20px; }
        .full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        input { padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.95rem; width: 100%; }
        
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
        .btn-submit { background: #0f172a; color: white; padding: 10px 24px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
      `}</style>
    </div>
  );
}