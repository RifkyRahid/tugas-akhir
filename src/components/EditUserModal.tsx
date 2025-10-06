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
  const [formData, setFormData] = useState({ ...user, areaId: user.areaId || "" });
  const [showPassword, setShowPassword] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);

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
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Edit Karyawan</h2>

        <div className="modal-form">
          <label>Full Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} />

          <label>Password</label>
          <div className="password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <label className="show-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Tampilkan Password
            </label>
          </div>

          <label>Position</label>
          <input
            name="position"
            value={formData.position || ""}
            onChange={handleChange}
          />

          <label>Join Date</label>
          <input
            name="joinDate"
            type="date"
            value={formData.joinDate.split("T")[0]}
            onChange={handleChange}
          />

          <label>Area Absensi</label>
          <select name="areaId" value={formData.areaId} onChange={handleChange}>
            <option value="">Pilih Area Absensi</option>
            {areas.map((area: any) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div className="modal-buttons">
          <button className="btn-submit" onClick={() => onSubmit(formData)}>
            Simpan
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Batal
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
        }

        .modal-card {
          background: white;
          border-left: 8px solid #fdd835;
          border-radius: 10px;
          padding: 1.2rem 1.2rem 1rem 1.2rem;
          width: 340px;
          max-width: 95vw;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }

        .modal-title {
          color: #0d47a1;
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        input {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .password-group {
          display: flex;
          flex-direction: column;
        }

        .show-toggle {
          margin-top: 0.25rem;
          font-size: 0.85rem;
          color: #555;
        }

        .modal-buttons {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
        }

        .btn-submit {
          background: #1976d2;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
        }

        .btn-cancel {
          background: #e0e0e0;
          color: #333;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
