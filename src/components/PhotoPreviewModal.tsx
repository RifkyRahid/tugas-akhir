"use client";
import React from "react";
import "@/styles/modal.css";

interface PhotoPreviewModalProps {
  photo: string;
  onClose: () => void;
}

export default function PhotoPreviewModal({ photo, onClose }: PhotoPreviewModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <h3>Foto Absensi</h3>
        <img
          src={photo}
          alt="Foto Absensi"
          style={{ maxWidth: "100%", borderRadius: 8, marginTop: 16 }}
        />
        <button onClick={onClose} className="add-button" style={{ marginTop: 16 }}>
          Tutup
        </button>
      </div>
    </div>
  );
}
