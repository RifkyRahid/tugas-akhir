"use client";
import React from "react";

interface PhotoPreviewModalProps {
  photo: string;
  onClose: () => void;
}

export default function PhotoPreviewModal({ photo, onClose }: PhotoPreviewModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Foto Absensi</h3>
        </div>
        
        <div className="image-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt="Foto Absensi"
            style={{ 
              width: "100%", 
              height: "100%", // Isi container
              objectFit: 'contain', // Pastikan seluruh foto terlihat
              borderRadius: 4,
            }}
          />
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="close-button">
            Tutup
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 20px;
        }
        .modal-content {
          background: #fff; border-radius: 16px;
          width: 100%; max-width: 400px;
          /* Tidak ada tinggi tetap, menyesuaikan konten */
          display: flex; flex-direction: column;
          overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .modal-header {
            padding: 15px; text-align: center; border-bottom: 1px solid #eee;
        }
        .modal-header h3 { margin: 0; color: #333; font-size: 1.1rem; }
        
        .image-container {
            width: 100%;
            /* KITA PAKAI ASPEK RASIO YANG SAMA (4:3) AGAR KONSISTEN */
            aspect-ratio: 4 / 3;
            background: #000;
            padding: 0; /* Hapus padding agar full */
        }

        .modal-footer {
            padding: 15px; border-top: 1px solid #eee;
        }
        .close-button {
          width: 100%; padding: 12px;
          background: #3b82f6; color: white;
          border: none; border-radius: 10px;
          font-weight: 600; font-size: 16px; cursor: pointer;
        }
      `}</style>
    </div>
  );
}