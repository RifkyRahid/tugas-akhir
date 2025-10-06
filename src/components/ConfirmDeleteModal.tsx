"use client";

import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, message }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ marginBottom: "10px", color: "var(--primary-blue)" }}>Konfirmasi Hapus</h3>
        <p>{message}</p>
        <div className="form-actions" style={{ marginTop: "15px" }}>
          <button onClick={onConfirm} className="primary-button">
            Ya, Hapus
          </button>
          <button onClick={onClose} className="secondary-button">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
