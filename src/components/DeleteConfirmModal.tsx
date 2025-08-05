'use client'
import React from 'react'

type DeleteConfirmModalProps = {
  isOpen: boolean
  userName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({ isOpen, userName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">
          Hapus <span className="highlight">{userName}</span> permanen?
        </h2>
        <p className="modal-subtitle">Hapus semua data yang berhubungan</p>
        <div className="modal-buttons">
          <button className="btn-delete" onClick={onConfirm}>Yes</button>
          <button className="btn-cancel" onClick={onCancel}>Check Again</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
        }

        .modal-box {
          background: #ffffff;
          padding: 2rem;
          border-radius: 5px;
          width: 400px;
          text-align: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #0d47a1;
        }

        .modal-subtitle {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        .highlight {
          color: #1d3557;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn-delete {
          background: #e63946;
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-delete:hover {
          background: #d62839;
        }

        .btn-cancel {
          background: #457b9d;
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-cancel:hover {
          background: #35607a;
        }
      `}</style>
    </div>
  )
}
