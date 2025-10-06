"use client";

import React, { useState, useEffect } from "react";
import "@/styles/areaabsensi.css";
import ModalFormArea from "@/components/ModalFormArea";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function AreaAbsensiPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [deleteTarget, setDeleteTarget] = useState<any>(null); // area yang mau dihapus

  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      const res = await fetch("/api/master/area-absensi");
      const data = await res.json();
      if (res.ok && data?.data) setAreas(data.data);
    } catch (err) {
      console.error("Gagal mengambil data area", err);
    }
  }

  function handleTambahArea() {
    setEditData(null); // reset ke mode tambah
    setIsModalOpen(true);
  }

  function handleEditArea(area: any) {
    setEditData(area);
    setIsModalOpen(true);
  }

  function handleDeleteArea(area: any) {
    setDeleteTarget(area);
  }

  async function handleSubmitArea(data: any) {
    try {
      if (data.id) {
        await fetch(`/api/master/area-absensi/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`/api/master/area-absensi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      fetchAreas();
    } catch (err) {
      console.error("Gagal simpan area", err);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/master/area-absensi/${deleteTarget.id}`, {
        method: "DELETE",
      });
      fetchAreas();
    } catch (err) {
      console.error("Gagal hapus area", err);
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="area-absensi-container">
      <h1 className="page-title">Daftar Area Absensi</h1>

      <div className="header-actions">
        <button className="primary-button" onClick={handleTambahArea}>
          + Tambah Area Baru
        </button>
      </div>

      <div className="table-section">
        <table className="area-table">
          <thead>
            <tr>
              <th>Nama Lokasi</th>
              <th>Alamat</th>
              <th>Jumlah Penempatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {areas.length > 0 ? (
              areas.map((area) => (
                <tr key={area.id}>
                  <td>{area.name}</td>
                  <td>{area.alamat || "Alamat belum diisi"}</td>
                  <td>{area.jumlahPersonalia || 0}</td>
                  <td>
                    <button
                      className="action-btn"
                      title="Ubah"
                      onClick={() => handleEditArea(area)}
                    >
                      <img src="/icons/edit.png" alt="Ubah" className="icon-btn" />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Hapus"
                      onClick={() => handleDeleteArea(area)}
                    >
                      <img src="/icons/remove.png" alt="Hapus" className="icon-btn" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Belum ada area absensi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      <ModalFormArea
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitArea}
        initialData={editData}
      />

      {/* Modal Hapus */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        message={`Yakin ingin menghapus area "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
