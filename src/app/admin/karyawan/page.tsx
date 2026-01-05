"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/lib/auth";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserSlash, FaUserCheck } from "react-icons/fa"; // Tambah Icon Baru

import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";

import "@/styles/dashboard.css";

// Tipe Data User
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  position?: string;
  positionId?: number;
  jabatan?: {
    title: string;
    department?: {
      name: string;
    };
  };
  joinDate: string;
  isActive: boolean; // Field Baru
  createdAt: string;
  updatedAt: string;
  areaId?: string;
  area?: { name?: string };
};

export default function KelolaKaryawanPage() {
  const router = useRouter();
  
  // --- STATE DATA ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FILTER & PAGINATION ---
  const [filterStatus, setFilterStatus] = useState<"active" | "inactive">("active"); // Filter Status Baru
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE MODAL ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Cek Auth
  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  // --- 1. FETCH DATA (Dynamic berdasarkan Status) ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Panggil API dengan parameter status
      const res = await fetch(`/api/karyawan?status=${filterStatus}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Gagal memuat data karyawan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ulang saat filter status berubah
  useEffect(() => {
    fetchData();
    setCurrentPage(1); // Reset ke halaman 1 tiap ganti tab
  }, [filterStatus]);

  // --- 2. FILTER SEARCH & AREA ---
  const filteredData = useMemo(() => {
    let temp = users;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      temp = temp.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          (u.jabatan?.title || "").toLowerCase().includes(lower)
      );
    }

    if (filterArea !== "all") {
      temp = temp.filter((u) => u.area?.name === filterArea);
    }

    return temp;
  }, [users, searchTerm, filterArea]);

  // --- 3. PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 4. ACTION HANDLERS ---

  // Toggle Status (Nonaktifkan / Aktifkan)
  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const action = currentStatus ? "Nonaktifkan" : "Aktifkan";
    const confirmColor = currentStatus ? "#d33" : "#3085d6";

    const result = await Swal.fire({
      title: `${action} ${name}?`,
      text: currentStatus 
        ? "User tidak bisa login lagi, tapi data historis tetap aman."
        : "User akan bisa login dan absen kembali.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#aaa",
      confirmButtonText: `Ya, ${action}!`,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/karyawan/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        });

        if (!res.ok) throw new Error("Gagal update status");

        Swal.fire("Berhasil!", `Status berhasil diubah.`, "success");
        fetchData(); 
      } catch (err) {
        Swal.fire("Error", "Gagal mengubah status.", "error");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Permanen?",
      text: "Data absen & riwayat akan hilang! Gunakan Nonaktifkan jika ragu.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/karyawan?id=${id}`, { method: "DELETE" });
        Swal.fire("Dihapus!", "User telah dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan.", "error");
      }
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
     setShowEditModal(false);
     fetchData();
  };

  // --- STYLE OBJECTS (Sesuai gaya kodinganmu) ---
  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px",
      borderBottom: "1px solid #eee", paddingBottom: "15px"
    },
    title: { fontSize: "24px", color: "#333", margin: 0 },
    addButton: {
      backgroundColor: "#0070f3", color: "white", padding: "10px 15px", borderRadius: "5px",
      border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
      fontSize: "14px", fontWeight: "bold" as "bold"
    },
    // Style untuk Tab Filter Baru
    tabContainer: {
        display: "flex", gap: "10px", marginBottom: "20px"
    },
    tabButton: (isActiveTab: boolean, type: 'active' | 'inactive') => ({
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold" as "bold",
        backgroundColor: isActiveTab 
            ? (type === 'active' ? "#0070f3" : "#d33") // Biru utk Aktif, Merah utk Nonaktif
            : "#f0f0f0",
        color: isActiveTab ? "white" : "#555",
        transition: "0.3s"
    }),
    controls: {
      display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" as "wrap",
      justifyContent: "space-between", alignItems: "center"
    },
    searchContainer: {
        display: "flex", alignItems: "center", border: "1px solid #ccc", 
        borderRadius: "5px", padding: "5px 10px", backgroundColor: "#fff", width: "300px"
    },
    input: {
      border: "none", outline: "none", padding: "8px", width: "100%", fontSize: "14px"
    },
    select: {
      padding: "8px", borderRadius: "5px", border: "1px solid #ccc", outline: "none"
    },
    table: {
      width: "100%", borderCollapse: "collapse" as "collapse", marginTop: "10px"
    },
    th: {
      borderBottom: "2px solid #eee", padding: "12px", textAlign: "left" as "left", 
      color: "#555", fontWeight: "bold" as "bold", backgroundColor: "#fafafa"
    },
    td: {
      borderBottom: "1px solid #eee", padding: "12px", color: "#333", verticalAlign: "middle"
    },
    statusBadge: (isActive: boolean) => ({
        padding: "5px 10px", borderRadius: "15px", fontSize: "12px", fontWeight: "bold" as "bold",
        backgroundColor: isActive ? "#e6fffa" : "#fff5f5",
        color: isActive ? "#2c7a7b" : "#c53030",
        border: isActive ? "1px solid #b2f5ea" : "1px solid #fed7d7"
    }),
    actionBtn: (color: string) => ({
      padding: "8px", borderRadius: "5px", border: "1px solid #ddd", 
      backgroundColor: "white", color: color, cursor: "pointer", 
      marginRight: "5px", fontSize: "16px", display: "inline-flex", alignItems: "center"
    }),
    pagination: {
        marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "14px"
    },
    pageBtn: (disabled: boolean) => ({
        padding: "8px 15px", border: "1px solid #ccc", borderRadius: "5px",
        backgroundColor: disabled ? "#eee" : "white",
        color: disabled ? "#999" : "#333",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: "5px"
    })
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
            <h1 style={styles.title}>Kelola Karyawan</h1>
            <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
                Manajemen data pegawai aktif & nonaktif
            </p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
          <FaPlus /> Tambah Karyawan
        </button>
      </div>

      {/* --- FILTER TAB (BARU) --- */}
      <div style={styles.tabContainer}>
        <button 
            onClick={() => setFilterStatus("active")}
            style={styles.tabButton(filterStatus === "active", 'active')}
        >
            Karyawan Aktif
        </button>
        <button 
            onClick={() => setFilterStatus("inactive")}
            style={styles.tabButton(filterStatus === "inactive", 'inactive')}
        >
            Nonaktif / Resign
        </button>
      </div>

      {/* Search & Filter Area */}
      <div style={styles.controls}>
        <div style={styles.searchContainer}>
            <FaSearch color="#999" />
            <input
                type="text"
                placeholder="Cari nama, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
            />
        </div>
        <div>
            <span style={{ marginRight: "10px", fontSize: "14px", color: "#666" }}>Filter Unit:</span>
            <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                style={styles.select}
            >
                <option value="all">Semua Area</option>
                {[...new Set(users.map(u => u.area?.name).filter(Boolean))].map(area => (
                    <option key={area} value={area}>{area}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading data...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nama & Email</th>
                <th style={styles.th}>Jabatan / Unit</th>
                <th style={styles.th} align="center">Bergabung</th>
                <th style={styles.th} align="center">Status</th>
                <th style={styles.th} align="center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((user, index) => (
                  <tr key={user.id}>
                    <td style={styles.td}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "bold", color: "#333" }}>{user.name}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{user.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div>{user.jabatan?.title || user.position || "-"}</div>
                      {user.area?.name && (
                        <span style={{ 
                            fontSize: "11px", backgroundColor: "#e0f2fe", color: "#0284c7", 
                            padding: "2px 6px", borderRadius: "4px", marginTop: "3px", display: "inline-block"
                        }}>
                          {user.area.name}
                        </span>
                      )}
                    </td>
                    <td style={styles.td} align="center">
                      {new Date(user.joinDate).toLocaleDateString("id-ID")}
                    </td>
                    <td style={styles.td} align="center">
                        <span style={styles.statusBadge(user.isActive)}>
                            {user.isActive ? "AKTIF" : "NONAKTIF"}
                        </span>
                    </td>
                    <td style={styles.td} align="center">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(user)}
                        style={styles.actionBtn("#0070f3")}
                        title="Edit Data"
                      >
                        <FaEdit />
                      </button>

                      {/* Toggle Status Button (BARU) */}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive, user.name)}
                        style={{
                            ...styles.actionBtn(user.isActive ? "#d97706" : "#059669"),
                            borderColor: user.isActive ? "#fcd34d" : "#6ee7b7",
                            backgroundColor: user.isActive ? "#fffbeb" : "#ecfdf5"
                        }}
                        title={user.isActive ? "Nonaktifkan Akun" : "Aktifkan Kembali"}
                      >
                        {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ ...styles.actionBtn("#d33"), borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
                        title="Hapus Permanen"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#999", fontStyle: "italic" }}>
                    Tidak ada data karyawan {filterStatus === 'active' ? 'aktif' : 'nonaktif'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
            <div>
                Halaman <strong>{currentPage}</strong> dari {totalPages}
            </div>
            <div>
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={styles.pageBtn(currentPage === 1)}
                >
                    &laquo; Sebelumnya
                </button>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={styles.pageBtn(currentPage === totalPages)}
                >
                    Selanjutnya &raquo;
                </button>
            </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserAdded={() => {
            fetchData();
          }}
        />
      )}

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onCancel={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}