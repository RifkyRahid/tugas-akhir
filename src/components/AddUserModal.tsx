"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert

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
    position: "",
    joinDate: "",
    areaId: "",
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

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validasi sederhana
    if (!formData.name || !formData.email || !formData.password) {
        Swal.fire("Peringatan", "Nama, Email, dan Password wajib diisi.", "warning");
        return;
    }

    try {
      // 1. Tampilkan Loading
      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang menambahkan data karyawan.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await fetch("/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pastikan areaId dikirim sebagai integer jika ada isinya
        body: JSON.stringify({
            ...formData,
            areaId: formData.areaId ? parseInt(formData.areaId) : null
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        
        // 2. Tampilkan Sukses
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Karyawan baru telah ditambahkan.',
            timer: 1500,
            showConfirmButton: false
        });

        // Update data di parent
        onUserAdded(newUser);
        
        // Reset Form
        setFormData({
            name: "",
            email: "",
            password: "",
            position: "",
            joinDate: "",
            areaId: ""
        });
        onClose();
      } else {
        throw new Error("Gagal response");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menambahkan data.',
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
            <h2 className="modal-title">Tambah Karyawan Baru</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
            {/* Form Grid 2 Kolom (Agar Rapi & Lega) */}
            <div className="form-grid">
                <div className="form-group">
                    <label>Nama Lengkap <span style={{color:'red'}}>*</span></label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Nama Karyawan"
                    />
                </div>

                <div className="form-group">
                    <label>Email <span style={{color:'red'}}>*</span></label>
                    <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="email@perusahaan.com"
                    />
                </div>

                {/* Password Section */}
                <div className="form-group">
                    <label>Password <span style={{color:'red'}}>*</span></label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password Login"
                        />
                        <div className="checkbox-wrapper">
                            <input
                                id="showPassAdd"
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassAdd" style={{fontSize:'0.8rem', cursor:'pointer'}}>Lihat</label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Jabatan / Posisi</label>
                    <input
                        name="position"
                        value={formData.position}
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

                <div className="form-group">
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

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            Simpan Data
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
          /* Lebar disamakan dengan modal Edit (750px) */
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
            grid-template-columns: 1fr 1fr;
            /* Jarak antar elemen dibuat lega */
            column-gap: 30px;
            row-gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* Input Full Width jika di mobile */
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
            width: 100%;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

        @media (max-width: 640px) {
            .form-grid {
                grid-template-columns: 1fr;
                row-gap: 15px;
            }
            .modal-card {
                width: 95%;
            }
        }
      `}</style>
    </div>
  );
}