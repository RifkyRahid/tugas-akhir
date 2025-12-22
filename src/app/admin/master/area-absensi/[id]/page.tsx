"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import "@/styles/areaabsensi.css";

export default function DetailAreaPage() {
  const router = useRouter();
  const params = useParams();
  const areaId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [areaName, setAreaName] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (areaId) {
      fetchEmployeesInArea();
    }
  }, [areaId]);

  // 1. Ambil data karyawan
  async function fetchEmployeesInArea() {
    setLoading(true);
    try {
      const res = await fetch(`/api/master/area-absensi/${areaId}/employees`);
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.data);
        setAreaName(data.areaName);
      } else {
        Swal.fire("Error", data.error || "Gagal memuat data", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Fungsi cari karyawan
  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/master/area-absensi/${areaId}/add-employee?q=${query}`
      );
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Gagal mencari", error);
    } finally {
      setIsSearching(false);
    }
  }

  // 3. Fungsi Menambahkan
  async function handleAddEmployee(user: any) {
    try {
      Swal.fire({ title: "Menambahkan...", didOpen: () => Swal.showLoading() });

      const res = await fetch(
        `/api/master/area-absensi/${areaId}/add-employee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (res.ok) {
        Swal.fire({
          icon: "success", title: "Berhasil", text: "Karyawan ditambahkan",
          timer: 1000, showConfirmButton: false,
        });
        setSearchQuery("");
        setSearchResults([]);
        fetchEmployeesInArea();
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan", "error");
      }
    } catch (err) {
      Swal.fire("Gagal", "Koneksi error", "error");
    }
  }

  // 4. Fungsi Menghapus
  async function handleRemoveEmployee(userId: string, userName: string) {
    Swal.fire({
      title: "Keluarkan Karyawan?",
      text: `Keluarkan "${userName}" dari area ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Keluarkan!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `/api/master/area-absensi/${areaId}/employees?userId=${userId}`,
            { method: "DELETE" }
          );

          if (res.ok) {
            Swal.fire("Berhasil!", "Karyawan dikeluarkan.", "success");
            fetchEmployeesInArea();
          } else {
            Swal.fire("Gagal", "Gagal menghapus data.", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Koneksi error.", "error");
        }
      }
    });
  }

  return (
    <div className="area-absensi-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "25px", gap: "15px" }}>
        <button
          onClick={() => router.push("/admin/master/area-absensi")}
          className="secondary-button"
          style={{ cursor: "pointer", padding: "8px 15px", border: "1px solid #ccc", background: "#fff", borderRadius: "5px" }}
        >
          ← Kembali
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px" }}>Kelola Karyawan</h2>
          <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
            Area: <strong>{loading ? "Memuat..." : areaName}</strong>
          </p>
        </div>
      </div>

      {/* Pencarian */}
      <div style={{ position: "relative", marginBottom: "30px", maxWidth: "600px", background: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
        <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
          Tambahkan Karyawan Baru
        </label>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
          *Hanya menampilkan karyawan yang belum memiliki area absensi.
        </p>

        <input
          type="text"
          placeholder="Ketik nama karyawan..."
          className="form-input"
          style={{ width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #ddd" }}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {/* Dropdown Hasil Pencarian */}
        {searchResults.length > 0 && (
          <div style={{
              position: "absolute", top: "calc(100% - 20px)", left: "20px", right: "20px",
              backgroundColor: "white", border: "1px solid #ddd", borderRadius: "0 0 5px 5px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: "300px", overflowY: "auto",
            }}
          >
            {searchResults.map((user) => (
              <div
                key={user.id}
                style={{ padding: "12px 15px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => handleAddEmployee(user)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "#333" }}>{user.name}</div>
                  {/* UPDATE TAMPILAN JABATAN DI SEARCH */}
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {user.jabatan?.title || user.position || "Staff"} - {user.email}
                  </div>
                </div>
                <button style={{ padding: "6px 12px", background: "#2ecc71", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
                  + Tambah
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="table-section">
        <h3 style={{ marginBottom: "15px" }}>Daftar Karyawan Terdaftar ({employees.length})</h3>
        <table className="area-table">
          <thead>
            <tr>
              <th>Nama Lengkap</th>
              <th>Posisi</th>
              <th>Email</th>
              <th style={{ width: "100px", textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>Sedang memuat data...</td></tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  
                  {/* --- PERBAIKAN UTAMA DISINI --- */}
                  {/* Prioritaskan jabatan dari relasi, fallback ke data lama */}
                  <td>
                    {emp.jabatan?.title ? (
                        <span style={{fontWeight:'500', color:'#0f172a'}}>{emp.jabatan.title}</span>
                    ) : (
                        <span style={{color:'#64748b', fontStyle:'italic'}}>{emp.position || "-"}</span>
                    )}
                  </td>
                  
                  <td>{emp.email}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="action-btn delete"
                      title="Keluarkan dari area"
                      onClick={() => handleRemoveEmployee(emp.id, emp.name)}
                      style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "4px", padding: "5px" }}
                    >
                      <img src="/icons/remove.png" alt="Hapus" style={{ width: "18px", height: "18px", display: "block" }} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#888" }}>Belum ada karyawan di area ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}