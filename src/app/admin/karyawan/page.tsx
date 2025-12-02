"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/lib/auth";
import Swal from "sweetalert2";

import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";

import "@/styles/dashboard.css";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  position?: string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  areaId?: string;
  area?: { name?: string };
};

export default function KelolaKaryawanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATES UNTUK FILTER & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [sortOption, setSortOption] = useState("oldest"); // oldest, newest, a-z
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(10);
  const [currentPage, setCurrentPage] = useState(1);

  // State Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- 1. FETCH DATA UTAMA ---
  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (!user || user.role !== "admin") {
      router.push("/login");
    } else {
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/karyawan");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Gagal fetch data karyawan:", err);
      Swal.fire("Error", "Gagal mengambil data karyawan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIKA FILTER, SORTING, PAGINATION (CLIENT SIDE) ---
  
  // Ambil list unik area untuk dropdown filter
  const uniqueAreas = useMemo(() => {
    const areas = users.map(u => u.area?.name).filter(Boolean) as string[];
    return Array.from(new Set(areas));
  }, [users]);

  // Proses Filter & Sorting
  const processedUsers = useMemo(() => {
    let filtered = [...users];

    // Filter Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          (u.position && u.position.toLowerCase().includes(lower))
      );
    }

    // Filter Area
    if (filterArea !== "all") {
      filtered = filtered.filter((u) => u.area?.name === filterArea);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Paling baru ditambahkan
      } else if (sortOption === "a-z") {
        return a.name.localeCompare(b.name); // Abjad
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Default: Paling lama (First added)
      }
    });

    return filtered;
  }, [users, searchTerm, filterArea, sortOption]);

  // Proses Pagination
  const paginatedUsers = useMemo(() => {
    if (itemsPerPage === "all") return processedUsers;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedUsers.slice(startIndex, endIndex);
  }, [processedUsers, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(processedUsers.length / itemsPerPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterArea, itemsPerPage]);


  // --- 3. HANDLERS (CRUD) ---

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedUser: User) => {
    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });
      
      const res = await fetch(`/api/karyawan/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
        setShowEditModal(false);
        setSelectedUser(null);
        Swal.fire("Berhasil", "Data karyawan diperbarui", "success");
      } else {
        throw new Error("Gagal update");
      }
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat mengedit", "error");
    }
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: `Hapus ${user.name}?`,
      text: "PERINGATAN: Ini adalah Hard Delete. Semua data absensi, riwayat cuti, dan akun login karyawan ini akan dihapus permanen dan TIDAK BISA DIKEMBALIKAN.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus Permanen!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Menghapus...', didOpen: () => Swal.showLoading() });

        const res = await fetch(`/api/karyawan/${user.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          Swal.fire("Terhapus!", "Data karyawan bersih total.", "success");
        } else {
          throw new Error("Gagal hapus");
        }
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Header & Tombol Tambah */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h1 style={{ color: "#0d47a1", margin: 0 }}>Kelola Karyawan</h1>
            <button
            onClick={() => setShowAddModal(true)}
            style={{
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px"
            }}
            >
            <span>+</span> Tambah Karyawan
            </button>
        </div>

        {/* --- TOOLBAR FILTER & SEARCH --- */}
        <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px', 
            flexWrap: 'wrap',
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        }}>
            {/* 1. Search Bar */}
            <div style={{ flex: '1 1 200px' }}>
                <input 
                    type="text" 
                    placeholder="Cari nama atau email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>

            {/* 2. Filter Area */}
            <div style={{ flex: '0 0 150px' }}>
                <select 
                    value={filterArea} 
                    onChange={(e) => setFilterArea(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="all">Semua Area</option>
                    {uniqueAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>

            {/* 3. Sorting */}
            <div style={{ flex: '0 0 180px' }}>
                <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="oldest">Pertama Ditambahkan</option>
                    <option value="newest">Paling Baru</option>
                    <option value="a-z">Abjad (A-Z)</option>
                </select>
            </div>

            {/* 4. Limit Data */}
            <div style={{ flex: '0 0 120px' }}>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(e.target.value === "all" ? "all" : Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value={10}>10 Baris</option>
                    <option value={20}>20 Baris</option>
                    <option value={50}>50 Baris</option>
                    <option value="all">Semua</option>
                </select>
            </div>
        </div>

        {/* --- TABEL DATA --- */}
        <div style={{ overflowX: 'auto' }}>
            <table className="styled-table">
            <thead>
                <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Posisi</th>
                <th>Tgl Gabung</th>
                <th>Area Absensi</th>
                <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Memuat data...</td></tr>
                ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                    <tr key={user.id}>
                        <td>{itemsPerPage === "all" ? index + 1 : (currentPage - 1) * (itemsPerPage as number) + index + 1}</td>
                        <td>
                            <div style={{fontWeight: 'bold'}}>{user.name}</div>
                            <div style={{fontSize: '11px', color: '#666'}}>ID: {user.id.substring(0,8)}...</div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.position || "-"}</td>
                        <td>{new Date(user.joinDate).toLocaleDateString('id-ID')}</td>
                        <td>
                            {user.area?.name ? (
                                <span style={{background: '#e3f2fd', color: '#1565c0', padding: '3px 8px', borderRadius: '4px', fontSize: '12px'}}>
                                    {user.area.name}
                                </span>
                            ) : (
                                <span style={{color: '#999', fontSize: '12px', fontStyle: 'italic'}}>Belum ada area</span>
                            )}
                        </td>
                        <td>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button
                                className="btn-action edit"
                                onClick={() => handleEditClick(user)}
                                title="Edit Data"
                                style={{background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                            >
                                ✏️
                            </button>
                            <button
                                className="btn-action delete"
                                onClick={() => handleDelete(user)}
                                title="Hapus Permanen"
                                style={{background: '#ef5350', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                            >
                                🗑️
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} style={{textAlign: 'center', padding: '30px', color: '#666'}}>
                            Tidak ada data yang cocok dengan filter.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {itemsPerPage !== "all" && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '8px 15px',
                        border: '1px solid #ccc',
                        background: currentPage === 1 ? '#eee' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        borderRadius: '5px'
                    }}
                >
                    &laquo; Sebelumnya
                </button>
                
                <span style={{ fontWeight: 'bold' }}>
                    Halaman {currentPage} dari {totalPages}
                </span>

                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '8px 15px',
                        border: '1px solid #ccc',
                        background: currentPage === totalPages ? '#eee' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        borderRadius: '5px'
                    }}
                >
                    Selanjutnya &raquo;
                </button>
            </div>
        )}

      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserAdded={(newUser: User) => {
            setUsers((prev) => [...prev, newUser]);
            fetchData(); // Refresh biar urutan benar
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