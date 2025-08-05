"use client";
import React, { useState } from "react";

type EditUserModalProps = {
  isOpen: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    position?: string;
    joinDate: string;
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
  const [formData, setFormData] = useState({ ...user });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          padding: 2rem;
          width: 400px;
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
          gap: 0.75rem;
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
