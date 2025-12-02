"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation"; // TAMBAHAN: Untuk navigasi
import Swal from "sweetalert2";
import "@/styles/areaabsensi.css";

// 1. Definisikan komponen dinamis
const ModalFormArea = dynamic(() => import("@/components/ModalFormArea"), {
  loading: () => <p>Memuat formulir...</p>,
  ssr: false,
});

export default function AreaAbsensiPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // TAMBAHAN: Inisialisasi router
  const router = useRouter();

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
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal mengambil data area!",
      });
    }
  }

  function handleTambahArea() {
    setEditData(null);
    setIsModalOpen(true);
  }

  function handleEditArea(area: any) {
    setEditData(area);
    setIsModalOpen(true);
  }

  // TAMBAHAN: Fungsi untuk pindah ke halaman detail karyawan per area
  function handleKelolaKaryawan(id: string) {
    // Kita arahkan ke dynamic route berdasarkan ID Area
    router.push(`/admin/master/area-absensi/${id}`);
  }

  function handleDeleteArea(area: any) {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Anda akan menghapus area "${area.name}". Data yang dihapus tidak dapat dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Menghapus...",
            text: "Mohon tunggu sebentar.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const res = await fetch(`/api/master/area-absensi/${area.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            Swal.fire("Terhapus!", "Area berhasil dihapus.", "success");
            fetchAreas();
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (err) {
          console.error("Gagal hapus area", err);
          Swal.fire(
            "Gagal!",
            "Terjadi kesalahan saat menghapus area.",
            "error"
          );
        }
      }
    });
  }

  async function handleSubmitArea(data: any) {
    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const method = data.id ? "PUT" : "POST";
      const url = data.id
        ? `/api/master/area-absensi/${data.id}`
        : "/api/master/area-absensi";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Data area berhasil ${data.id ? "diperbarui" : "ditambahkan"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        setIsModalOpen(false);
        fetchAreas();
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (err) {
      console.error("Gagal simpan area", err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data area.",
      });
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
                    {/* TAMBAHAN: Tombol Kelola Karyawan */}
                    <button
                      className="action-btn"
                      title="Kelola Karyawan"
                      onClick={() => handleKelolaKaryawan(area.id)}
                      style={{ marginRight: "5px" }} // Sedikit spasi antar tombol
                    >
                      <img
                        src="/icons/group.png"
                        alt="Users"
                        className="icon-btn"
                      />
                    </button>

                    <button
                      className="action-btn"
                      title="Ubah"
                      onClick={() => handleEditArea(area)}
                    >
                      <img
                        src="/icons/edit.png"
                        alt="Ubah"
                        className="icon-btn"
                      />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Hapus"
                      onClick={() => handleDeleteArea(area)}
                    >
                      <img
                        src="/icons/remove.png"
                        alt="Hapus"
                        className="icon-btn"
                      />
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

      <ModalFormArea
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitArea}
        initialData={editData}
      />
    </div>
  );
}
