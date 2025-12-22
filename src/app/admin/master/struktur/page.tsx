"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaBuilding } from "react-icons/fa"; // Pastikan install react-icons
import "@/styles/struktur.css";

// Tipe Data
interface Position {
  id: number;
  title: string;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
  positions: Position[];
}

export default function StrukturOrganisasiPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/master/departemen"); // Panggil API Dept yg include Position
      const json = await res.json();
      if (json.data) {
        setDepartments(json.data);
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================
  // LOGIC DEPARTEMEN
  // ==========================

  const handleAddDept = async () => {
  const { value: name } = await Swal.fire({
    title: "Tambah Unit Bisnis / Departemen",
    input: "text",
    inputLabel: "Nama Departemen",
    inputPlaceholder: "Contoh: SHOWROOM, BENGKEL",
    // 1. VISUAL: Paksa tampilan input jadi Uppercase
    inputAttributes: {
      style: "text-transform: uppercase",
      autocapitalize: "characters"
    },
    showCancelButton: true,
    confirmButtonText: "Simpan",
    confirmButtonColor: "#2563eb",
    inputValidator: (value) => {
      if (!value) return "Nama tidak boleh kosong!";
    },
  });

  if (name) {
    try {
      Swal.showLoading();
      const res = await fetch("/api/master/departemen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2. DATA: Paksa simpan sebagai Uppercase
        body: JSON.stringify({ name: name.toUpperCase() }), 
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Departemen ditambahkan", "success");
        fetchData();
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan", "error");
    }
  }
};

const handleEditDept = async (dept: Department) => {
  const { value: name } = await Swal.fire({
    title: "Ubah Nama Departemen",
    input: "text",
    inputValue: dept.name,
    inputAttributes: {
      style: "text-transform: uppercase",
      autocapitalize: "characters"
    },
    showCancelButton: true,
    confirmButtonText: "Update",
    inputValidator: (value) => {
      if (!value) return "Nama tidak boleh kosong!";
    },
  });

  if (name && name !== dept.name) {
    try {
      const res = await fetch(`/api/master/departemen/${dept.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.toUpperCase() }), // Uppercase
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Data diperbarui", "success");
        fetchData();
      }
    } catch (err) {
      Swal.fire("Error", "Gagal update", "error");
    }
  }
};

  const handleDeleteDept = async (dept: Department) => {
    const result = await Swal.fire({
      title: `Hapus ${dept.name}?`,
      text: "Semua jabatan di dalamnya juga akan terhapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/master/departemen/${dept.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          Swal.fire("Terhapus!", "Departemen telah dihapus.", "success");
          fetchData();
        } else {
            Swal.fire("Gagal", "Terjadi kesalahan server", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus", "error");
      }
    }
  };

  // ==========================
  // LOGIC JABATAN (POSITION)
  // ==========================

  const handleAddPos = async (deptId: number, deptName: string) => {
  const { value: title } = await Swal.fire({
    title: `Tambah Jabatan di ${deptName}`,
    input: "text",
    inputLabel: "Nama Jabatan",
    inputPlaceholder: "Contoh: ADMIN, MEKANIK",
    inputAttributes: {
      style: "text-transform: uppercase",
      autocapitalize: "characters"
    },
    showCancelButton: true,
    confirmButtonText: "Simpan",
    confirmButtonColor: "#2563eb",
    inputValidator: (value) => {
      if (!value) return "Nama jabatan wajib diisi!";
    },
  });

  if (title) {
    try {
      const res = await fetch("/api/master/jabatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.toUpperCase(), departmentId: deptId }), // Uppercase
      });

      if (res.ok) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Jabatan ditambahkan',
            timer: 1000,
            showConfirmButton: false
        });
        fetchData();
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menambah jabatan", "error");
    }
  }
};

const handleEditPos = async (pos: Position) => {
  const { value: title } = await Swal.fire({
    title: "Edit Nama Jabatan",
    input: "text",
    inputValue: pos.title,
    inputAttributes: {
      style: "text-transform: uppercase",
      autocapitalize: "characters"
    },
    showCancelButton: true,
    confirmButtonText: "Update",
  });

  if (title && title !== pos.title) {
    try {
      const res = await fetch(`/api/master/jabatan/${pos.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.toUpperCase() }), // Uppercase
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }
};

  const handleDeletePos = async (pos: Position) => {
    const result = await Swal.fire({
      title: "Hapus Jabatan?",
      text: `Jabatan "${pos.title}" akan dihapus. Pastikan tidak ada karyawan aktif di jabatan ini.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Hapus",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/master/jabatan/${pos.id}`, {
          method: "DELETE",
        });
        
        const json = await res.json();

        if (res.ok) {
          Swal.fire("Terhapus", "Jabatan berhasil dihapus", "success");
          fetchData();
        } else {
          // Tampilkan pesan error dari server (misal: masih ada karyawan)
          Swal.fire("Gagal", json.error || "Gagal menghapus", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Terjadi kesalahan", "error");
      }
    }
  };

  return (
    <div className="struktur-container">
      {/* Header Halaman */}
      <div className="page-header">
        <div>
            <h1 className="page-title">Struktur Organisasi</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
                Kelola Unit Bisnis dan Daftar Jabatan Karyawan
            </p>
        </div>
        <button className="btn-add-dept" onClick={handleAddDept}>
          <FaPlus /> Unit Bisnis Baru
        </button>
      </div>

      {loading ? (
        <p>Memuat data struktur...</p>
      ) : (
        <div className="dept-grid">
          {departments.length === 0 ? (
            <p style={{ color: '#64748b' }}>Belum ada data departemen.</p>
          ) : (
            departments.map((dept) => (
              <div className="dept-card" key={dept.id}>
                {/* Header Kartu */}
                <div className="dept-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBuilding style={{ color: '#f59e0b' }} />
                    <h3 className="dept-name">{dept.name}</h3>
                  </div>
                  <div className="dept-actions">
                    <button 
                        className="icon-btn" 
                        title="Edit Departemen"
                        onClick={() => handleEditDept(dept)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                        className="icon-btn delete" 
                        title="Hapus Departemen"
                        onClick={() => handleDeleteDept(dept)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Body Kartu (List Jabatan) */}
                <div className="dept-body">
                  {dept.positions.length > 0 ? (
                    <ul className="pos-list">
                      {dept.positions.map((pos) => (
                        <li className="pos-item" key={pos.id}>
                          <span className="pos-title">{pos.title}</span>
                          <div className="dept-actions">
                            <button 
                                className="icon-btn"
                                onClick={() => handleEditPos(pos)}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button 
                                className="icon-btn delete"
                                onClick={() => handleDeletePos(pos)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>
                      Belum ada jabatan
                    </div>
                  )}
                </div>

                {/* Footer Kartu */}
                <div className="dept-footer">
                  <button 
                    className="btn-add-pos"
                    onClick={() => handleAddPos(dept.id, dept.name)}
                  >
                    + Tambah Jabatan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}